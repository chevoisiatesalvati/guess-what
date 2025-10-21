// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GuessWhatGame is ReentrancyGuard, Ownable {
    struct Game {
        uint256 gameId;
        string topWord;
        bytes32 middleWordHash;
        uint256 middleWordLength;
        string bottomWord;
        uint256 entryFee;
        uint256 totalPrize;
        uint256 basePrizeAmount;
        uint256 startTime;
        bool isActive;
        bool isCompleted;
        address winner;
        mapping(address => bool) players;
        mapping(address => string) playerGuesses;
    }

    struct PlayerStats {
        uint256 gamesPlayed;
        uint256 guessesPlayed;
        uint256 correctGuesses;
        uint256 totalWinnings;
        uint256 accuracy; // in basis points (10000 = 100%)
    }

    // State variables
    uint256 public nextGameId = 1;
    uint256 public platformFeePercent = 5; // 5% default platform fee
    uint256 public treasuryBalance;
    uint256 public defaultPrizeMultiplier = 10; // Base prize = entry fee * multiplier
    
    mapping(uint256 => Game) public games;
    mapping(address => PlayerStats) public playerStats;
    mapping(address => uint256[]) public playerGames;
    
    // Admin management
    mapping(address => bool) public admins;
    address[] public adminList;
    
    // Events
    event GameCreated(uint256 indexed gameId, uint256 entryFee, uint256 basePrizeAmount);
    event PlayerJoined(uint256 indexed gameId, address indexed player, uint256 entryFee);
    event GuessSubmitted(uint256 indexed gameId, address indexed player, string guess);
    event GameWon(uint256 indexed gameId, address indexed winner, uint256 prize);
    event GameExpired(uint256 indexed gameId, uint256 totalPrize);
    event PrizeClaimed(uint256 indexed gameId, address indexed winner, uint256 amount);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event TreasuryFunded(address indexed funder, uint256 amount);
    event TreasuryWithdrawn(address indexed recipient, uint256 amount);
    event PrizeMultiplierUpdated(uint256 oldMultiplier, uint256 newMultiplier);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    // Constructor
    constructor(address initialOwner, address[] memory initialAdmins) Ownable(initialOwner) {
        // Add initial admins
        for (uint256 i = 0; i < initialAdmins.length; i++) {
            if (initialAdmins[i] != address(0)) {
                admins[initialAdmins[i]] = true;
                adminList.push(initialAdmins[i]);
                emit AdminAdded(initialAdmins[i]);
            }
        }
    }

    // Modifiers
    modifier gameExists(uint256 _gameId) {
        require(_gameId > 0 && _gameId < nextGameId, "Game does not exist");
        _;
    }

    modifier gameActive(uint256 _gameId) {
        require(games[_gameId].isActive, "Game is not active");
        _;
    }


    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner(), "Only admin or owner");
        _;
    }

    // Functions
    function createGame(
        string memory _topWord,
        bytes32 _middleWordHash,
        uint256 _middleWordLength,
        string memory _bottomWord,
        uint256 _entryFee
    ) external onlyAdmin returns (uint256) {
        require(_entryFee > 0, "Entry fee must be greater than 0");
        require(_middleWordHash != bytes32(0), "Middle word hash cannot be empty");
        
        uint256 gameId = nextGameId++;
        Game storage game = games[gameId];
        
        // Calculate base prize amount from treasury (entry fee * multiplier)
        uint256 basePrize = _entryFee * defaultPrizeMultiplier;
        require(treasuryBalance >= basePrize, "Insufficient treasury balance");
        
        game.gameId = gameId;
        game.topWord = _topWord;
        game.middleWordHash = _middleWordHash;
        game.middleWordLength = _middleWordLength;
        game.bottomWord = _bottomWord;
        game.entryFee = _entryFee;
        game.basePrizeAmount = basePrize;
        game.totalPrize = 0; // Grows as players guess
        game.startTime = block.timestamp;
        game.isActive = true;
        game.isCompleted = false;
        game.winner = address(0);
        
        emit GameCreated(gameId, _entryFee, basePrize);
        return gameId;
    }

    // joinGame() removed - players auto-join on first guess for better UX

    function submitGuess(uint256 _gameId, string memory _guess) external payable gameExists(_gameId) gameActive(_gameId) nonReentrant {
        Game storage game = games[_gameId];
        require(msg.value == game.entryFee, "Incorrect entry fee");
        
        // Get player stats storage reference once
        PlayerStats storage stats = playerStats[msg.sender];
        
        // Auto-join on first guess (seamless UX - no separate join needed)
        if (!game.players[msg.sender]) {
            game.players[msg.sender] = true;
            playerGames[msg.sender].push(_gameId);
            
            // Update player stats - first time playing this game
            stats.gamesPlayed++;
            
            // Recalculate accuracy
            if (stats.gamesPlayed > 0) {
                stats.accuracy = (stats.correctGuesses * 10000) / stats.gamesPlayed;
            }
            
            emit PlayerJoined(_gameId, msg.sender, msg.value);
        }
        
        // Add entry fee to accumulated prize pool
        game.totalPrize += msg.value;
        
        // Update player stats - increment guesses played
        stats.guessesPlayed++;
        
        // Store the latest guess
        game.playerGuesses[msg.sender] = _guess;
        
        // This prevents reading the answer from contract storage
        if (keccak256(bytes(_guess)) == game.middleWordHash) {
            _endGame(_gameId, msg.sender);
        } else {
            // Incorrect guess - add to treasury
            treasuryBalance += msg.value;
        }
        
        emit GuessSubmitted(_gameId, msg.sender, _guess);
    }

    function _endGame(uint256 _gameId, address _winner) internal {
        Game storage game = games[_gameId];
        game.isActive = false;
        game.isCompleted = true;
        game.winner = _winner;
        
        // Total prize = base prize from treasury + accumulated guesses (minus last correct guess)
        // Note: game.totalPrize includes the winning guess fee, which we already added to treasury
        // So we need to subtract it back out
        uint256 accumulatedPrize = game.totalPrize > game.entryFee ? game.totalPrize - game.entryFee : 0;
        uint256 totalPrizeAmount = game.basePrizeAmount + accumulatedPrize;
        
        // Calculate platform fee from total
        uint256 platformFee = (totalPrizeAmount * platformFeePercent) / 100;
        uint256 winnerPrize = totalPrizeAmount - platformFee;
        
        // Deduct base prize from treasury
        require(treasuryBalance >= game.basePrizeAmount, "Insufficient treasury");
        treasuryBalance -= game.basePrizeAmount;
        
        // Update player stats
        PlayerStats storage stats = playerStats[_winner];
        stats.correctGuesses++;
        stats.totalWinnings += winnerPrize;
        // Calculate accuracy: correctGuesses / gamesPlayed
        if (stats.gamesPlayed > 0) {
            stats.accuracy = (stats.correctGuesses * 10000) / stats.gamesPlayed;
        }
        
        // Transfer prize to winner (base from treasury + accumulated from guesses)
        if (winnerPrize > 0) {
            payable(_winner).transfer(winnerPrize);
        }
        
        // Transfer platform fee to owner
        if (platformFee > 0) {
            payable(owner()).transfer(platformFee);
        }
        
        emit GameWon(_gameId, _winner, winnerPrize);
    }

    function getGameInfo(uint256 _gameId) external view gameExists(_gameId) returns (
        uint256 gameId,
        string memory topWord,
        uint256 middleWordLength,
        string memory bottomWord,
        uint256 entryFee,
        uint256 totalPrize,
        uint256 basePrizeAmount,
        uint256 startTime,
        bool isActive,
        bool isCompleted,
        address winner
    ) {
        Game storage game = games[_gameId];
        return (
            game.gameId,
            game.topWord,
            game.middleWordLength,
            game.bottomWord,
            game.entryFee,
            game.totalPrize,
            game.basePrizeAmount,
            game.startTime,
            game.isActive,
            game.isCompleted,
            game.winner
        );
    }

    function getPlayerStats(address _player) external view returns (
        uint256 gamesPlayed,
        uint256 guessesPlayed,
        uint256 correctGuesses,
        uint256 totalWinnings,
        uint256 accuracy
    ) {
        PlayerStats storage stats = playerStats[_player];
        return (
            stats.gamesPlayed,
            stats.guessesPlayed,
            stats.correctGuesses,
            stats.totalWinnings,
            stats.accuracy
        );
    }

    function getPlayerGames(address _player) external view returns (uint256[] memory) {
        return playerGames[_player];
    }

    function isPlayerInGame(uint256 _gameId, address _player) external view gameExists(_gameId) returns (bool) {
        return games[_gameId].players[_player];
    }

    function hasPlayerGuessed(uint256 _gameId, address _player) external view gameExists(_gameId) returns (bool) {
        return bytes(games[_gameId].playerGuesses[_player]).length > 0;
    }

    function getPlayerGuess(uint256 _gameId, address _player) external view gameExists(_gameId) returns (string memory) {
        return games[_gameId].playerGuesses[_player];
    }

    function getRandomActiveGame() external view returns (uint256) {
        require(nextGameId > 1, "No games exist");
        
        // Get all active games
        uint256[] memory activeGames = new uint256[](nextGameId - 1);
        uint256 activeCount = 0;
        
        for (uint256 i = 1; i < nextGameId; i++) {
            if (games[i].isActive && !games[i].isCompleted) {
                activeGames[activeCount] = i;
                activeCount++;
            }
        }
        
        require(activeCount > 0, "No active games available");
        
        // Use block timestamp as seed for randomness
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % activeCount;
        return activeGames[randomIndex];
    }

    function getActiveGamesCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i < nextGameId; i++) {
            if (games[i].isActive && !games[i].isCompleted) {
                count++;
            }
        }
        return count;
    }

    function isOwner(address _address) external view returns (bool) {
        return _address == owner();
    }

    // Admin management functions
    function addAdmin(address _admin) external onlyOwner {
        require(_admin != address(0), "Invalid address");
        require(!admins[_admin], "Already an admin");
        
        admins[_admin] = true;
        adminList.push(_admin);
        emit AdminAdded(_admin);
    }

    function removeAdmin(address _admin) external onlyOwner {
        require(admins[_admin], "Not an admin");
        require(_admin != owner(), "Cannot remove owner");
        
        admins[_admin] = false;
        
        // Remove from adminList
        for (uint256 i = 0; i < adminList.length; i++) {
            if (adminList[i] == _admin) {
                adminList[i] = adminList[adminList.length - 1];
                adminList.pop();
                break;
            }
        }
        
        emit AdminRemoved(_admin);
    }

    function isAdmin(address _address) external view returns (bool) {
        return admins[_address] || _address == owner();
    }

    function getAdminList() external view returns (address[] memory) {
        return adminList;
    }

    function getAdminCount() external view returns (uint256) {
        return adminList.length;
    }

    // Treasury management functions
    function fundTreasury() external payable onlyAdmin {
        require(msg.value > 0, "Must send funds");
        treasuryBalance += msg.value;
        emit TreasuryFunded(msg.sender, msg.value);
    }
    
    function withdrawFromTreasury(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(treasuryBalance >= _amount, "Insufficient treasury balance");
        
        treasuryBalance -= _amount;
        payable(owner()).transfer(_amount);
        emit TreasuryWithdrawn(owner(), _amount);
    }
    
    function setPrizeMultiplier(uint256 _multiplier) external onlyOwner {
        require(_multiplier > 0, "Multiplier must be greater than 0");
        uint256 oldMultiplier = defaultPrizeMultiplier;
        defaultPrizeMultiplier = _multiplier;
        emit PrizeMultiplierUpdated(oldMultiplier, _multiplier);
    }
    
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 50, "Fee cannot exceed 50%");
        uint256 oldFee = platformFeePercent;
        platformFeePercent = _feePercent;
        emit PlatformFeeUpdated(oldFee, _feePercent);
    }
    
    function getTreasuryBalance() external view returns (uint256) {
        return treasuryBalance;
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Emergency function to close a game and return accumulated prizes
    function emergencyCloseGame(uint256 _gameId) external onlyAdmin nonReentrant {
        Game storage game = games[_gameId];
        require(game.isActive, "Game is not active");
        
        uint256 accumulatedPrize = game.totalPrize;
        
        game.isActive = false;
        game.isCompleted = true;
        game.totalPrize = 0; // Prevent re-entrancy
        
        // Return accumulated prizes to treasury
        if (accumulatedPrize > 0) {
            treasuryBalance += accumulatedPrize;
        }
        
        emit GameExpired(_gameId, accumulatedPrize);
    }
}
