const { accounts, contract, web3 } = require('@openzeppelin/test-environment');
const { constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const PhoenixFactory = contract.fromArtifact('PhoenixFactory');
const WalletLogic = contract.fromArtifact('WalletLogic');

describe('PhoenixStack', function () {
	const [ alice, bob, charles ] = accounts;

	beforeEach(async function () {
		this.factory = await PhoenixFactory.new({ from: alice });
		this.wallet = await WalletLogic.new({ from: alice });
	});

	it('initialize', async function () {
		const id     = web3.utils.randomHex(32);
		const master = this.wallet.address;
		const init   = this.wallet.contract.methods.initialize(alice).encodeABI();
		const receipt = await this.factory.instanciate(id, master, init, { from: alice });
		const proxy = await WalletLogic.at(receipt.logs.find(({ event }) => event == 'NewProxy').args.proxy);

		expect(await proxy.owner()).to.be.equal(alice);
		expect(await proxy.factory()).to.be.equal(this.factory.address);
	});

	describe('reset', function () {

		beforeEach(async function () {
			this.id     = web3.utils.randomHex(32);
			this.master = this.wallet.address;
			this.init1  = this.wallet.contract.methods.initialize(alice).encodeABI();
			this.init2  = this.wallet.contract.methods.initialize(bob).encodeABI();
			this.init3  = this.wallet.contract.methods.initialize(charles).encodeABI();
			({ logs: this.logs } = await this.factory.instanciate(this.id, this.master, this.init1, { from: alice }));
			this.proxy = await WalletLogic.at(this.logs.find(({ event }) => event == 'NewProxy').args.proxy);
		});

		it('clean state', async function () {
			await this.proxy.reset(constants.ZERO_BYTES32, constants.ZERO_ADDRESS, { from: alice });
			expect(await web3.eth.getCode(this.proxy.address)).to.be.equal('0x');
		});

		it('reinstanciate without lock', async function () {
			await this.proxy.reset(
				constants.ZERO_BYTES32,
				constants.ZERO_ADDRESS,
				{ from: alice }
			);

			const receipt = await this.factory.instanciate(this.id, this.master, this.init2, { from: bob });
			expectEvent(receipt, 'NewProxy', { id: this.id, proxy: this.proxy.address });

			expect(await this.proxy.owner()).to.be.equal(bob);
			expect(await this.proxy.factory()).to.be.equal(this.factory.address);
		});

		it('reinstanciate with valid lock', async function () {
			await this.proxy.reset(
				web3.utils.keccak256(web3.eth.abi.encodeParameters([ 'address', 'bytes' ], [ this.master, this.init2 ])),
				constants.ZERO_ADDRESS,
				{ from: alice }
			);

			const receipt = await this.factory.instanciate(this.id, this.master, this.init2, { from: bob });
			expectEvent(receipt, 'NewProxy', { id: this.id, proxy: this.proxy.address });

			expect(await this.proxy.owner()).to.be.equal(bob);
			expect(await this.proxy.factory()).to.be.equal(this.factory.address);
		});

		it('reinstanciate with invalid lock', async function () {
			await this.proxy.reset(
				web3.utils.keccak256(web3.eth.abi.encodeParameters([ 'address', 'bytes' ], [ this.master, this.init2 ])),
				constants.ZERO_ADDRESS,
				{ from: alice }
			);

			await expectRevert(
				this.factory.instanciate(this.id, this.master, this.init3, { from: charles }),
				'reinstanciation-pevented-by-lock'
			);
		});
	});
});
