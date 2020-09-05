// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "../PhoenixCore.sol";

contract WalletLogic is PhoenixCore {
    address public owner;

    event Initialized(address owner);

    receive() external payable {}

    function initialize(address admin) external {
        require(owner == address(0));
        owner = admin;
        emit Initialized(admin);
    }

    function execute(address to, uint256 value, bytes calldata data) external payable returns (bool success, bytes memory returndata){
        require(msg.sender == owner);
        (success, returndata) = to.call{value: value}(data);
    }

    function reset(bytes32 next, address payable recipient) external {
        require(msg.sender == owner);
        _reset(next, recipient);
    }
}
