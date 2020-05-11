App = {
  web3Provider: null,
  contracts: {},
  account: null,
  userInstance: null,
  appAdminAddress: null,
  appAccount1Address:null,

  init: async function() {
    //
    return await App.initWeb3();
  },

  initWeb3: async function() {
    /*
     * Replace me...
     */
    if(window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.enable();
      } catch(error) {
        console.error("User denied account access")
      }
    }else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
    }
    web3 = new Web3(App.web3Provider);

    var account = App.getAccountParam();
    if (null == account)  {
      console.log("initAccount");
      App.initAccount();
    } else {
      App.account = account;
      console.log("account:" + account);
    }

    return App.initContract();
  },

  getAccountParam: function() {
    var reg = new RegExp("(^|&)account=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
  },
  initAccount: function() {
    web3.eth.getAccounts(function(error, accounts) {
      App.account = accounts[0];
    });
  },


  initContract: function() {
    /*
     * Replace me...
     */

    $.getJSON('InfoContract.json', function(data) {
      App.contracts.userContract = TruffleContract(data);
      App.contracts.userContract.setProvider(App.web3Provider);

      App.contracts.userContract.deployed().then(function(instance) {
        App.userInstance = instance;
        console.log('create infoInstance successfully');

        return App.initAdminAddress();
      });

    });

    return App.bindEvents();
  },


  bindEvents: function() {

    $("#temp").on('click', async function () {

      var ipfs = window.IpfsApi('localhost', '5001');


      //const fileBuffer = new Buffer.from(reader.result);

      const buffer = Buffer.from('this is a demo')
      ipfs.add("this is a demo")
          .then( rsp => console.log(rsp[0].hash))
          .catch(err => console.error(err))

    });


    $("#regbtn").on('click', function () {
      if('0x7bf7ec691f690138f9dce1140057c7d2876faaa2' == App.appAccount1Address) {
        console.log("register");
        var email = $("#register-email").val();
        var password = $("#register-password").val();
        var companyType = $("#company-type").val();
        var account = $("#login-account").val();
        console.log(account);

        App.userInstance.createUser(email, password, companyType, account).then(function (result) {
          $("#isRegistered").html("create user account successfully");
          console.log('add user successfully');
        }).catch(function (err) {
          console.log('fail to add user');
          console.log(err.message);
        });
      }else {
        $("#isRegistered").html("please switch to admin metamask account");
        console.log("please switch to right metamask account");
      }

    });

    $("#login").on('click', function () {
      console.log("login");
      var email = $("#login-email").val();
      var password = $("#login-password").val();

      App.userInstance.login(email, password).then(function (result) {
        if(result[0] == 0x0000000000000000000000000000000000000000) {
          $("#status").html("wrong email or password");
          console.log('wrong email or password');
          console.log(result[2].c[0])
        } else if(result[1] == ' ') {
          $("#status").html("please switch to right metamask account");
          console.log('please switch to right metamask account');
        }
        else {
          console.log('successfully');
          console.log("infoAddress: "+result[3]);
          var data = {
            "email": email,
            "address": result[0],
            "companyType": result[1],
            "companies": result[2].c[0],
            "infoAddress": result[3],
            "adminAddress":App.appAdminAddress
          }
          window.location.href="user.html?"+$.param(data);
        }

      }).catch(function (err) {
        console.log('fail to login');
        console.log(err.message);
      });
    });


    $("#admin").on('click', function () {
      console.log("go toadmin page");
      if('0x7bf7ec691f690138f9dce1140057c7d2876faaa2' == App.appAccount1Address) {
        window.location.href="admin.html?address="+App.appAdminAddress;
      }else {
        $("#adminStatus").html("please switch to admin metamask account");
      }

    });

  },

  initAdminAddress: function() {

    App.userInstance.admin().then(function (result) {
      App.appAccount1Address = result;
      App.appAdminAddress = '0xad830B6D2cf8D5a35DBa2F39D8D5F8e26fE1623b';
      console.log(result);

    }).catch(function (err) {
      console.log('fail to login in admin');
      console.log(err.message);
    });
  }





};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

