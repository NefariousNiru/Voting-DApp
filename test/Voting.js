var Voting = artifacts.require("./Voting.sol");
// testing the smart contract. Free of gas. Not mined to the block
contract("Voting", function(accounts){
    it("initializes with two contestants", function(){
        return Voting.deployed().then(function(instance){
            return instance.contestantsCount();
        }).then(function(count){
            assert.equal(count,2);
        });
    });
    it ("initializes the contestants witht the correct values", function(){
        return Voting.deployed().then(function(instance){
            votingInstance = instance;
            return votingInstance.contestants(1);
        }).then(function(contestant){
            assert.equal(contestant[0],1,"Contains correct id");
            assert.equal(contestant[1],"Iron Man","contains the correct name");
            assert.equal(contestant[2],0,"Contains correct vote count");
            return votingInstance.contestants(2);
        }).then(function(contestant){
            assert.equal(contestant[0],2,"Contains correct id");
            assert.equal(contestant[1],"Captain America","contains the correct name");
            assert.equal(contestant[2],0,"Contains correct vote count");
        })
    })

    it("allows a voter to cast a vote", function(){
        return Voting.deployed().then(function(instance){
            votingInstance = instance;
            contestantId = 1;
            return votingInstance.vote(contestantId, {from: accounts[0]});
        }).then(function(receipt){
            return votingInstance.voters(accounts[0])
        }).then(function(voted){
            assert(voted, "the voter was marked as voted");
            return votingInstance.contestants(contestantId);
        }).then(function(contestant){
            var voteCount = contestant[2];
            console.log(voteCount);
            assert.equal(voteCount, 1,"increments the contestant's vote count")
        })
    });
});