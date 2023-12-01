const Web3 = require("web3");

App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    if(window.ethereum){
      App.web3Provider = window.ethereum;
      try{
        await window.ethereum.request({method:"eth_requestAccounts"});;
      }catch(error){
        console.error("User Denied account access")
      }
    }
    else if(window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    else{
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
    
  },

  initContract: function() {
    $.getJSON("Voting.json", function(voting){
      var votingArtifact = voting;
      App.contracts.Voting = TruffleContract(votingArtifact);
      App.contracts.Voting.setProvider(App.web3Provider);
    return App.render();
    });
  },
  listenForEvents: function(){
    App.contracts.Voting.deployed().then(function(instance){
      instance.votedEvent({},{
        fromBlock : 0,
        toBlock: "latest"
      }).watch(function(error,event){
        console.log("Event Triggered, event")
        App.render();
      });
    });
  },
  render: function(){
    var votingInstance;
    var loadingAddress = $("#loadingAddress");
    var content = $("#container");
    web3.eth.getCoinbase(function(err,account){
      if (err == null){
        App.account = account;
        loadingAddress.html("Your Account:"+ account);
      }
    });
    App.contracts.Voting.deployed().then(function(instance){
      votingInstance = instance;
      return votingInstance.contestantsCount();
    }).then(function(contestantCount){
      var contestantResult = $("#contestantResults");
      contestantResults.innerText = '';
      var contestantSelect =$("#contestantSelection");
      contestantSelection.innerText = '';
      for (var i = 1; i<= contestantCount;i++){
        votingInstance.contestants(i).then(function(contestant){
          var id = contestant[0];
          var name = contestant[1];
          var voteCount = contestant[2];
          var contestantTemplate = "<tr><th>" +id+ "</th><td>" +name+ "</td><td>" +voteCount+ `</td><td class="contestantflag${id}">` +`<img src="images/${id}.png">`+ "</td></tr>";
          contestantResults.insertAdjacentHTML('beforeend', contestantTemplate);
          var contestantOption = "<option value='"+id+ "'>"+name+"</option>";
          contestantSelection.insertAdjacentHTML('beforeend', contestantOption);
        });
      }
    }).catch(function(error){
      console.warn(error)
    }); 
  },

  castVote: function(){
    web3.eth.getCoinbase(function(err,account){
      if (err == null){
        App.account = account;
      }
    });
    var contestantId = $("#contestantSelection").val();
    App.contracts.Voting.deployed().then(function(instance){
      return instance.vote(contestantId, {from: App.account});
    }).then(function(result){
      $("#content").show();
      $("#loadingAddress").show();
      location.reload();
    }).catch(function(err){
      console.error(err);
  });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
