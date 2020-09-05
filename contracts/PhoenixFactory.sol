// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "./IPhoenixFactory.sol";
import "./PhoenixProxy.sol";

contract PhoenixFactory is IPhoenixFactory {
    mapping(address => bytes32) _locks;

    function instanciate(bytes32 id, address master, bytes calldata init) external override returns (address) {
        PhoenixProxy proxy = new PhoenixProxy{salt: id}();
        emit NewProxy(id, address(proxy));
        // check restriction
        bytes32 lock = _locks[address(proxy)];
        require(lock == bytes32(0) || lock == keccak256(abi.encode(master, init)), 'PhoenixFactory: prevented by lock');
        delete _locks[address(proxy)];
        // initialize
        proxy.initialize(master, init);
        return address(proxy);
    }

    function lock(address entry, bytes32 next) external override {
        require(_locks[entry] == bytes32(0), 'PhoenixFactory: cannot override lock');
        _locks[entry] = next;
        emit Lock(entry, next);
    }

    function lockOverride(bytes32 next) external override {
        _locks[address(msg.sender)] = next;
        emit Lock(address(msg.sender), next);
    }
}
