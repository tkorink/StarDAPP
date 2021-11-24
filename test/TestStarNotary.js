const StarNotary = artifacts.require("StarNotary");

let accounts;
let owner;
let user1;
let user2;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
    user1 = accounts[1];
    user2 = accounts[2];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]});
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!');
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

  // Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();
    let starId = 6;

    // 1. create a Star with different tokenId
    await instance.createStar('star', starId, {from: user1});

    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let tokenName = await instance.name.call();
    let tokenSymbol = await instance.symbol.call();
    assert.equal(tokenName, 'Udacity Starz');
    assert.equal(tokenSymbol, 'UDSZ');
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    let starId1 = 100;
    let starId2 = 200;
    
    // 1. create 2 Stars with different tokenId
    await instance.createStar('super star', starId1, {from: user1});
    await instance.createStar('ultra star', starId2, {from: owner});    //function only works with msg.sender

    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starId1, starId2);

    // 3. Verify that the owners changed
    assert.equal(await instance.ownerOf.call(starId2), user1);      //user1 now owns star 200
    assert.equal(await instance.ownerOf.call(starId1), owner);      //owner now owns star 100
});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();
    let starId = 7;
    
    // 1. create a Star with different tokenId
    await instance.createStar('mega star', starId, {from: owner});  //function only works with msg.sender

    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user2, starId);

    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf.call(starId), user2);      //user2 now owns star 300
});

it('lookUptokenIdToStarInfo test', async() => {
    let instance = await StarNotary.deployed();
    let starId = 8;
    
    // 1. create a Star with different tokenId
    await instance.createStar('giga star', starId, {from: user1});

    // 2. Call your method lookUptokenIdToStarInfo
    let _name = await instance.lookUptokenIdToStarInfo.call(starId);

    // 3. Verify if you Star name is the same
    assert.equal(_name, 'giga star');
});