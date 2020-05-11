Admin = {
    web3Provider: null,
    contracts: {},
    account: null,
    adminInstance: null,
    appAddress: null,
    appEmail: null,
    appPassword: null,
    appTypes: new Array(),
    appFishId:null,


    init: async function() {
        //
        Admin.getRequest();

        return await Admin.initWeb3();
    },

    initWeb3: async function() {
        /*
         * Replace me...
         */
        if(window.ethereum) {
            Admin.web3Provider = window.ethereum;
            try {
                await window.ethereum.enable();
            } catch(error) {
                console.error("User denied account access")
            }
        }else if (window.web3) {
            Admin.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            Admin.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
        }
        web3 = new Web3(Admin.web3Provider);

        var account = Admin.getAccountParam();
        if (null == account)  {
            console.log("initAccount");
            Admin.initAccount();
        } else {
            Admin.account = account;
            console.log("account:" + account);
        }

        return Admin.initContract();
    },

    getAccountParam: function() {
        var reg = new RegExp("(^|&)account=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    },
    initAccount: function() {
        web3.eth.getAccounts(function(error, accounts) {
            Admin.account = accounts[0];
        });
    },


    initContract: function() {
        /*
         * Replace me...
         */

        $.getJSON('AdminContract.json', function(data) {
            console.log("getJson");
            console.log(data.abi);
            var contractABI = web3.eth.contract(data.abi);

            Admin.adminInstance = contractABI.at(Admin.appAddress);
            console.log("Admin.userInstance: "+Admin.adminInstance);

        });

        return Admin.bindEvents();
    },


    bindEvents: function() {

        $("#get-info").on('click', function () {

            var fishId = $("#info-id").val();
            Admin.appFishId = fishId;

            var idAndType = fishId+"_"+Admin.appTypes[0];
            console.log("idAndType:" + idAndType);

            $("#user-result-email").empty();

            Admin.adminInstance.getInfo(idAndType,function(error,result) {
                if(!error) {
                    console.log("getInfo")
                    $("#user-result-email").val(result[0]);
                    $("#user-result-company").val(result[1]);
                    $("#user-result-city").attr("value",result[2]);
                    $("#user-result-freshness").val(result[3]);
                    $("#user-result-ipfs").attr("value",result[4]);
                    if(result[6] != '0x0000000000000000000000000000000000000000000000000000000000000000') {
                        $("#user-result-id").attr("value",result[6]);
                    }else {
                        $("#user-result-id").attr("value"," ");
                    }
                    $("#user-result-time").attr("value",result[5]);
                }else {
                    console.log('fail to get info');
                    console.log(error.message);
                }
            });


        });


        $("#user-result-ipfs").on('click', function () {

            var ipfsValue = $("#user-result-ipfs").val();
            console.log("ipfsValue: " + ipfsValue);
            window.open('https://gateway.ipfs.io/ipfs/'+ipfsValue);


        });

        $("#user-result-id").on('click', function () {

            var hashId = $("#user-result-id").val();
            console.log("hashId: " + hashId);
            window.open('https://ropsten.etherscan.io/tx/'+hashId);


        });


        $("#select-fishId").bind('change',function() {
            var fishId = Admin.appFishId;
            var companyType = $("#select-fishId").val();
            var typeOfCompany = "";
            if(companyType == "Infomation in seafood fishing company") {
                typeOfCompany = Admin.appTypes[0];
            }else if(companyType == "Infomation in logistics company") {
                typeOfCompany = Admin.appTypes[1];
            }else {
                typeOfCompany = Admin.appTypes[2];
            }
            var idAndType = fishId+"_"+typeOfCompany;
            console.log("select fishId: "+idAndType);

            Admin.adminInstance.getInfo(idAndType, function (error,result) {
                if(!error) {
                    $("#user-result-email").val(result[0]);
                    $("#user-result-company").val(result[1]);
                    $("#user-result-city").attr("value",result[2]);
                    $("#user-result-freshness").val(result[3]);
                    $("#user-result-time").attr("value",result[5]);
                    $("#user-result-ipfs").attr("value",result[4]);
                    if(result[6] != '0x0000000000000000000000000000000000000000000000000000000000000000') {
                        console.log(result[6]);
                        $("#user-result-id").attr("value",result[6]);
                    }else {
                        $("#user-result-id").attr("value"," ");
                        //$("#user-result-id").attr("disabled",true);
                    }
                    //$("#user-result-id").attr("value",result[6]);
                }else {
                    console.log('fail to obtain info');
                    console.log(error.message);
                }

            })
        });

    },


    getRequest: function() {
        console.log("User getRequest");
        var url = location.search; //获取url中"?"符后的字串
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            Admin.appAddress=unescape(strs[0].split("=")[1]);
        }
        console.log("User address: " + Admin.appAddress);

        Admin.appTypes.push("Logistics+company");
        Admin.appTypes.push("Restaurant");
        Admin.appTypes.push("Customer");
    },


};

$(function() {
    $(window).load(function() {
        Admin.init();
    });
});
