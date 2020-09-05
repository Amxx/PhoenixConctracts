// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "./IPhoenixFactory.sol";

abstract contract PhoenixCore {
    address public factory;

    function _attach(address link) internal {
        require(factory == address(0), 'PhoenixCore: already attached');
        factory = link;
    }

    function _reset(bytes32 next, address payable recipient) internal {
        IPhoenixFactory(factory).lockOverride(next);
        selfdestruct(recipient);
    }
}
