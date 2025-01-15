// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DocumentVerification
 * @dev A contract that stores document hashes and tracks verification status.
 */
contract DocumentVerification {
    struct Document {
        bytes32 documentHash; // The SHA-256 hash of the off-chain document
        address owner; // The entity that initially submitted the doc
        bool isVerified; // Current verification status
    }

    mapping(bytes32 => Document) private documents;
    mapping(bytes32 => address[]) private verifiers;

    event DocumentSubmitted(address indexed owner, bytes32 documentHash);
    event VerificationApproved(address indexed verifier, bytes32 documentHash);
    event VerificationRevoked(address indexed verifier, bytes32 documentHash);

    /**
     * @notice Submits a new document hash to the contract.
     * @dev Reverts if the documentHash is already stored (i.e., doc exists).
     * @param documentHash The SHA-256 hash of the document.
     */
    function submitDocument(bytes32 documentHash) external {
        require(
            documents[documentHash].owner == address(0),
            'Document already exists'
        );
        documents[documentHash] = Document(documentHash, msg.sender, false);
        emit DocumentSubmitted(msg.sender, documentHash);
    }

    /**
     * @notice Approves verification of an existing document.
     * @dev Mark the document as verified and record `msg.sender` as a verifier.
     */
    function approveVerification(bytes32 documentHash) external {
        require(
            documents[documentHash].owner != address(0),
            'Document does not exist'
        );
        require(
            !documents[documentHash].isVerified,
            'Document already verified'
        );

        documents[documentHash].isVerified = true;
        verifiers[documentHash].push(msg.sender);

        emit VerificationApproved(msg.sender, documentHash);
    }

    /**
     * @notice Revokes verification of an existing verified document.
     * @dev This sets isVerified to false, but does not remove verifiers from array for a minimal approach.
     */
    function revokeVerification(bytes32 documentHash) external {
        require(
            documents[documentHash].owner != address(0),
            'Document does not exist'
        );
        require(documents[documentHash].isVerified, 'Document not verified');

        documents[documentHash].isVerified = false;

        emit VerificationRevoked(msg.sender, documentHash);
    }

    /**
     * @notice Returns whether a given document hash is currently verified.
     */
    function getVerificationStatus(
        bytes32 documentHash
    ) external view returns (bool) {
        return documents[documentHash].isVerified;
    }

    /**
     * @notice Returns the array of addresses that have approved the doc in the past.
     */
    function getVerifiers(
        bytes32 documentHash
    ) external view returns (address[] memory) {
        return verifiers[documentHash];
    }
}
