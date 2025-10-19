// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GuessWhatGame is ReentrancyGuard, Ownable {
    struct Game {
        uint256 gameId;
        string topWord;
        string middleWord;
        string bottomWord;
        uint256 entryFee;
        uint256 totalPrize;
        uint256 initialPrizePool; // Admin-assigned initial prize pool
        uint256 timeLimit;
        uint256 startTime;
        bool isActive;
        bool isCompleted;
        address winner;
        mapping(address => bool) players;
        mapping(address => string) playerGuesses;
    }

    struct PlayerStats {
        uint256 gamesPlayed;
        uint256 correctGuesses;
        uint256 totalWinnings;
        uint256 accuracy; // in basis points (10000 = 100%)
    }

    // State variables
    uint256 public nextGameId = 1;
    uint256 public defaultTimeLimit = 30; // 30 seconds (mutable)
    uint256 public constant PLATFORM_FEE_PERCENT = 5; // 5% platform fee
    
    mapping(uint256 => Game) public games;
    mapping(address => PlayerStats) public playerStats;
    mapping(address => uint256[]) public playerGames;
    
    // Admin management
    mapping(address => bool) public admins;
    address[] public adminList;
    
    // Events
    event GameCreated(uint256 indexed gameId, uint256 entryFee, uint256 timeLimit);
    event PlayerJoined(uint256 indexed gameId, address indexed player, uint256 entryFee);
    event GuessSubmitted(uint256 indexed gameId, address indexed player, string guess);
    event GameWon(uint256 indexed gameId, address indexed winner, uint256 prize);
    event GameExpired(uint256 indexed gameId, uint256 totalPrize);
    event PrizeClaimed(uint256 indexed gameId, address indexed winner, uint256 amount);
    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

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

    modifier gameNotExpired(uint256 _gameId) {
        require(
            block.timestamp <= games[_gameId].startTime + games[_gameId].timeLimit,
            "Game has expired"
        );
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner(), "Only admin or owner");
        _;
    }

    // Functions
    function createGame(
        string memory _topWord,
        string memory _middleWord,
        string memory _bottomWord,
        uint256 _entryFee,
        uint256 _initialPrizePool
    ) external onlyAdmin payable returns (uint256) {
        require(_entryFee > 0, "Entry fee must be greater than 0");
        require(msg.value >= _initialPrizePool, "Insufficient funds for prize pool");
        
        uint256 gameId = nextGameId++;
        Game storage game = games[gameId];
        
        game.gameId = gameId;
        game.topWord = _topWord;
        game.middleWord = _middleWord;
        game.bottomWord = _bottomWord;
        game.entryFee = _entryFee;
        game.initialPrizePool = _initialPrizePool;
        game.totalPrize = _initialPrizePool; // Start with admin's prize pool
        game.timeLimit = defaultTimeLimit;
        game.startTime = block.timestamp;
        game.isActive = true;
        game.isCompleted = false;
        game.winner = address(0);
        
        emit GameCreated(gameId, _entryFee, defaultTimeLimit);
        return gameId;
    }

    function joinGame(uint256 _gameId) external payable gameExists(_gameId) gameActive(_gameId) gameNotExpired(_gameId) {
        Game storage game = games[_gameId];
        require(!game.players[msg.sender], "Player already joined this game");
        require(msg.value == game.entryFee, "Incorrect entry fee");
        
        game.players[msg.sender] = true;
        game.totalPrize += msg.value;
        playerGames[msg.sender].push(_gameId);
        
        emit PlayerJoined(_gameId, msg.sender, msg.value);
    }

    function submitGuess(uint256 _gameId, string memory _guess) external gameExists(_gameId) gameActive(_gameId) gameNotExpired(_gameId) {
        Game storage game = games[_gameId];
        require(game.players[msg.sender], "Player not in this game");
        require(bytes(game.playerGuesses[msg.sender]).length == 0, "Already submitted guess");
        
        game.playerGuesses[msg.sender] = _guess;
        
        // Check if guess is correct
        if (keccak256(bytes(_guess)) == keccak256(bytes(game.middleWord))) {
            _endGame(_gameId, msg.sender);
        }
        
        emit GuessSubmitted(_gameId, msg.sender, _guess);
    }

    function _endGame(uint256 _gameId, address _winner) internal {
        Game storage game = games[_gameId];
        game.isActive = false;
        game.isCompleted = true;
        game.winner = _winner;
        
        // Calculate platform fee
        uint256 platformFee = (game.totalPrize * PLATFORM_FEE_PERCENT) / 100;
        uint256 winnerPrize = game.totalPrize - platformFee;
        
        // Update player stats
        PlayerStats storage stats = playerStats[_winner];
        stats.gamesPlayed++;
        stats.correctGuesses++;
        stats.totalWinnings += winnerPrize;
        stats.accuracy = (stats.correctGuesses * 10000) / stats.gamesPlayed;
        
        // Transfer prize to winner
        if (winnerPrize > 0) {
            payable(_winner).transfer(winnerPrize);
        }
        
        // Transfer platform fee to owner
        if (platformFee > 0) {
            payable(owner()).transfer(platformFee);
        }
        
        emit GameWon(_gameId, _winner, winnerPrize);
    }

    function expireGame(uint256 _gameId) external gameExists(_gameId) gameActive(_gameId) {
        Game storage game = games[_gameId];
        require(block.timestamp > game.startTime + game.timeLimit, "Game has not expired yet");
        
        game.isActive = false;
        game.isCompleted = true;
        
        // Add total prize to next game's prize pool (simplified for MVP)
        // In a full implementation, this would be handled differently
        
        emit GameExpired(_gameId, game.totalPrize);
    }

    function getGameInfo(uint256 _gameId) external view gameExists(_gameId) returns (
        uint256 gameId,
        string memory topWord,
        string memory middleWord,
        string memory bottomWord,
        uint256 entryFee,
        uint256 totalPrize,
        uint256 initialPrizePool,
        uint256 timeLimit,
        uint256 startTime,
        bool isActive,
        bool isCompleted,
        address winner
    ) {
        Game storage game = games[_gameId];
        return (
            game.gameId,
            game.topWord,
            game.middleWord,
            game.bottomWord,
            game.entryFee,
            game.totalPrize,
            game.initialPrizePool,
            game.timeLimit,
            game.startTime,
            game.isActive,
            game.isCompleted,
            game.winner
        );
    }

    function getPlayerStats(address _player) external view returns (
        uint256 gamesPlayed,
        uint256 correctGuesses,
        uint256 totalWinnings,
        uint256 accuracy
    ) {
        PlayerStats storage stats = playerStats[_player];
        return (
            stats.gamesPlayed,
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

    // Emergency functions
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function setTimeLimit(uint256 _newTimeLimit) external onlyOwner {
        require(_newTimeLimit >= 10 && _newTimeLimit <= 300, "Invalid time limit");
        defaultTimeLimit = _newTimeLimit;
    }
}
