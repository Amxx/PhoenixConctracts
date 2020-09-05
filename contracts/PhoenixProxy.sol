// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "./utils/UpgradeableProxy.sol";
import "./PhoenixCore.sol";

contract PhoenixProxy is UpgradeableProxy, PhoenixCore {
    constructor() {
        _attach(msg.sender);
    }

    function initialize(address _logic, bytes memory _data) public payable {
        require(_implementation() == address(0), 'PhoenixProxy: already initialized');
        _setImplementation(_logic);
        if(_data.length > 0) {
            (bool success,) = _logic.delegatecall(_data);
            require(success);
        }
    }
}
