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
    uint256 public constant MIN_ENTRY_FEE = 0.001 ether;
    uint256 public constant MAX_ENTRY_FEE = 0.1 ether;
    uint256 public defaultTimeLimit = 30; // 30 seconds (mutable)
    uint256 public constant PLATFORM_FEE_PERCENT = 5; // 5% platform fee
    
    mapping(uint256 => Game) public games;
    mapping(address => PlayerStats) public playerStats;
    mapping(address => uint256[]) public playerGames;
    
    // Events
    event GameCreated(uint256 indexed gameId, uint256 entryFee, uint256 timeLimit);
    event PlayerJoined(uint256 indexed gameId, address indexed player, uint256 entryFee);
    event GuessSubmitted(uint256 indexed gameId, address indexed player, string guess);
    event GameWon(uint256 indexed gameId, address indexed winner, uint256 prize);
    event GameExpired(uint256 indexed gameId, uint256 totalPrize);
    event PrizeClaimed(uint256 indexed gameId, address indexed winner, uint256 amount);

    // Constructor
    constructor(address initialOwner) Ownable(initialOwner) {}

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

    // Functions
    function createGame(
        string memory _topWord,
        string memory _middleWord,
        string memory _bottomWord,
        uint256 _entryFee
    ) external onlyOwner returns (uint256) {
        require(_entryFee >= MIN_ENTRY_FEE && _entryFee <= MAX_ENTRY_FEE, "Invalid entry fee");
        
        uint256 gameId = nextGameId++;
        Game storage game = games[gameId];
        
        game.gameId = gameId;
        game.topWord = _topWord;
        game.middleWord = _middleWord;
        game.bottomWord = _bottomWord;
        game.entryFee = _entryFee;
        game.totalPrize = 0;
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

    // Emergency functions
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function setTimeLimit(uint256 _newTimeLimit) external onlyOwner {
        require(_newTimeLimit >= 10 && _newTimeLimit <= 300, "Invalid time limit");
        defaultTimeLimit = _newTimeLimit;
    }
}
