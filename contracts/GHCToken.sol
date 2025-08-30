// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract GHCToken is ERC1155, AccessControl {
    using Strings for uint256;

    // Token metadata
    string public name = "Green Hydrogen Credit";
    string public symbol = "GHC";
    
    // Role constants
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    bytes32 public constant CERTIFIER_ROLE = keccak256("CERTIFIER_ROLE");
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    
    // Token types
    uint256 public constant MINT_TOKEN = 1;
    uint256 public constant TRANSFER_TOKEN = 2;
    uint256 public constant RETIRE_TOKEN = 3;
    
    // Status constants
    bytes32 public constant STATUS_ACTIVE = keccak256("Active");
    bytes32 public constant STATUS_PARTIAL = keccak256("Partial");
    bytes32 public constant STATUS_RETIRED = keccak256("Retired");
    
    // Token metadata URI
    string private _baseURI;
    
    // Token supply tracking
    mapping(uint256 => uint256) public totalSupply;
    mapping(uint256 => uint256) public mintedSupply;
    mapping(uint256 => uint256) public retiredSupply;
    
    // Batch tracking
    struct Batch {
        uint256 batchId;
        uint256 tokenType;
        uint256 quantity;
        uint256 issuanceDate;
        bytes32 status; // "Active", "Partial", "Retired"
        address issuer;
        bool exists;
    }
    
    mapping(uint256 => Batch) public batches;
    uint256 public batchCounter;
    
    // Events
    event BatchCreated(uint256 indexed batchId, uint256 tokenType, uint256 quantity, address indexed issuer);
    event TokensMinted(uint256 indexed batchId, uint256 quantity, address indexed to);
    event TokensTransferred(uint256 indexed batchId, uint256 quantity, address indexed from, address indexed to);
    event TokensRetired(uint256 indexed batchId, uint256 quantity, address indexed from);
    
    constructor() ERC1155("") {
        _baseURI = "https://api.h2ledger.com/metadata/";
        
        // Grant governance role to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        
        // Grant governance role to test accounts (hardcoded for now)
        _grantRole(GOVERNANCE_ROLE, 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
        _grantRole(GOVERNANCE_ROLE, 0x70997970C51812dc3A010C7d01b50e0d17dc79C8);
        _grantRole(GOVERNANCE_ROLE, 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC);
        
        // Grant certifier role to test accounts
        _grantRole(CERTIFIER_ROLE, 0x90F79bf6EB2c4f870365E785982E1f101E93b906);
        _grantRole(CERTIFIER_ROLE, 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65);
        _grantRole(CERTIFIER_ROLE, 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc);
        
        // Grant producer role to test accounts
        _grantRole(PRODUCER_ROLE, 0x976EA74026E726554dB657fA54763abd0C3a0aa9);
        _grantRole(PRODUCER_ROLE, 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955);
        _grantRole(PRODUCER_ROLE, 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f);
    }
    
    // Create a new batch
    function createBatch(uint256 _tokenType, uint256 _quantity) external onlyRole(GOVERNANCE_ROLE) returns (uint256) {
        require(_quantity > 0, "Quantity must be greater than 0");
        
        batchCounter++;
        uint256 batchId = batchCounter;
        
        batches[batchId] = Batch({
            batchId: batchId,
            tokenType: _tokenType,
            quantity: _quantity,
            issuanceDate: block.timestamp,
            status: STATUS_ACTIVE,
            issuer: msg.sender,
            exists: true
        });
        
        emit BatchCreated(batchId, _tokenType, _quantity, msg.sender);
        return batchId;
    }
    
    // Mint tokens for a specific batch
    function mintBatch(uint256 _batchId, address _to, uint256 _quantity) external onlyRole(GOVERNANCE_ROLE) {
        require(batches[_batchId].exists, "Batch does not exist");
        require(batches[_batchId].status == STATUS_ACTIVE, "Batch is not active");
        require(_quantity <= batches[_batchId].quantity, "Quantity exceeds batch limit");
        
        _mint(_to, _batchId, _quantity, "");
        mintedSupply[_batchId] += _quantity;
        
        emit TokensMinted(_batchId, _quantity, _to);
    }
    
    // Transfer tokens between addresses
    function transferBatch(uint256 _batchId, address _from, address _to, uint256 _quantity) external {
        require(batches[_batchId].exists, "Batch does not exist");
        require(balanceOf(_from, _batchId) >= _quantity, "Insufficient balance");
        
        _safeTransferFrom(_from, _to, _batchId, _quantity, "");
        
        emit TokensTransferred(_batchId, _quantity, _from, _to);
    }
    
    // Retire tokens (burn them)
    function retireBatch(uint256 _batchId, uint256 _quantity) external {
        require(batches[_batchId].exists, "Batch does not exist");
        require(balanceOf(msg.sender, _batchId) >= _quantity, "Insufficient balance");
        
        _burn(msg.sender, _batchId, _quantity);
        retiredSupply[_batchId] += _quantity;
        
        // Update batch status
        if (retiredSupply[_batchId] >= batches[_batchId].quantity) {
            batches[_batchId].status = STATUS_RETIRED;
        } else if (retiredSupply[_batchId] > 0) {
            batches[_batchId].status = STATUS_PARTIAL;
        }
        
        emit TokensRetired(_batchId, _quantity, msg.sender);
    }
    
    // Get batch information
    function getBatch(uint256 _batchId) external view returns (Batch memory) {
        require(batches[_batchId].exists, "Batch does not exist");
        return batches[_batchId];
    }
    
    // Get user's balance for a specific batch
    function getBatchBalance(address _user, uint256 _batchId) external view returns (uint256) {
        return balanceOf(_user, _batchId);
    }
    
    // Get total supply for a specific batch
    function getBatchTotalSupply(uint256 _batchId) external view returns (uint256) {
        return totalSupply[_batchId];
    }
    
    // Get status as string for frontend
    function getBatchStatusString(uint256 _batchId) external view returns (string memory) {
        require(batches[_batchId].exists, "Batch does not exist");
        bytes32 status = batches[_batchId].status;
        
        if (status == STATUS_ACTIVE) return "Active";
        if (status == STATUS_PARTIAL) return "Partial";
        if (status == STATUS_RETIRED) return "Retired";
        return "Unknown";
    }
    
    // Override URI function for metadata
    function uri(uint256 _tokenId) public view virtual override returns (string memory) {
        return string(abi.encodePacked(_baseURI, _tokenId.toString()));
    }
    
    // Set base URI (only governance)
    function setBaseURI(string memory _newBaseURI) external onlyRole(GOVERNANCE_ROLE) {
        _baseURI = _newBaseURI;
    }
    
    // Get all batches for a user
    function getUserBatches(address _user) external view returns (uint256[] memory) {
        // First count how many batches the user has
        uint256 count = 0;
        for (uint256 i = 1; i <= batchCounter; i++) {
            if (balanceOf(_user, i) > 0) {
                count++;
            }
        }
        
        // Create array with correct size
        uint256[] memory userBatches = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= batchCounter; i++) {
            if (balanceOf(_user, i) > 0) {
                userBatches[index] = i;
                index++;
            }
        }
        
        return userBatches;
    }
    
    // Role management functions (only governance can call)
    function grantRole(bytes32 role, address account) public override onlyRole(GOVERNANCE_ROLE) {
        _grantRole(role, account);
    }
    
    function revokeRole(bytes32 role, address account) public override onlyRole(GOVERNANCE_ROLE) {
        _revokeRole(role, account);
    }
    
    // Check if user has specific role
    function hasRole(bytes32 role, address account) public view override returns (bool) {
        return super.hasRole(role, account);
    }
    
    // Get user's roles as strings
    function getUserRoles(address _user) external view returns (string[] memory) {
        string[] memory roles = new string[](3);
        uint256 roleCount = 0;
        
        if (hasRole(GOVERNANCE_ROLE, _user)) {
            roles[roleCount] = "Governance";
            roleCount++;
        }
        if (hasRole(CERTIFIER_ROLE, _user)) {
            roles[roleCount] = "Certifier";
            roleCount++;
        }
        if (hasRole(PRODUCER_ROLE, _user)) {
            roles[roleCount] = "Producer";
            roleCount++;
        }
        
        // Resize array to actual count
        string[] memory finalRoles = new string[](roleCount);
        for (uint256 i = 0; i < roleCount; i++) {
            finalRoles[i] = roles[i];
        }
        
        return finalRoles;
    }
    
    // Override supportsInterface for AccessControl
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
