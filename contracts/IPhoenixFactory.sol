// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

interface IPhoenixFactory {
    event NewProxy(bytes32 indexed id, address indexed proxy);
    event Lock(address indexed proxy, bytes32 indexed next);

    function instanciate(bytes32 id, address master, bytes calldata init) external returns (address);
    function lock(address entry, bytes32 next) external;
    function lockOverride(bytes32 next) external;
}
