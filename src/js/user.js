User = {
    web3Provider: null,
    contracts: {},
    account: null,
    userInstance: null,
    appAddress: null,
    appEmail: null,
    appCompanies: null,
    appType: null,
    appIndex: null,
    appFishIdIndex: null,
    appAccepted:null,
    appInfoAddress: null,
    appAdminAddress:null,
    appBlockNumber: null,

    init: async function() {
        //
        User.getRequest();
        User.initAttributes();

        return await User.initWeb3();
    },

    initWeb3: async function() {
        /*
         * Replace me...
         */
        if(window.ethereum) {
            User.web3Provider = window.ethereum;
            try {
                await window.ethereum.enable();
            } catch(error) {
                console.error("User denied account access")
            }
        }else if (window.web3) {
            User.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            User.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
        }
        web3 = new Web3(User.web3Provider);

        var account = User.getAccountParam();
        if (null == account)  {
            console.log("initAccount");
            User.initAccount();
        } else {
            User.account = account;
            console.log("account:" + account);
        }

        console.log('Sending from Metamask account: ' + User.account);

        return User.initContract();
    },

    getAccountParam: function() {
        var reg = new RegExp("(^|&)account=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    },
    initAccount: function() {
        web3.eth.getAccounts(function(error, accounts) {
            User.account = accounts[0];
        });
    },


    initContract: function() {
        /*
         * Replace me...
         */

        $.getJSON('UserContract.json', function(data) {
            console.log("getJson");
            console.log(data.abi);
            var contractABI = web3.eth.contract(data.abi);

            User.userInstance = contractABI.at(User.appAddress);
            console.log("User.userInstance: "+User.userInstance);
            return User.initUserIndex();

        });


        return User.bindEvents();
    },


    bindEvents: function() {


        $("#reject").on('click', function () {

            var fishId = $("#user-fishId").val();
            var index = $("#user-fishId").get(0).selectedIndex;
            console.log("index:"+index);
            User.userInstance.rejectFishId(User.appInfoAddress,fishId,function(error,result) {
                if(!error) {
                    console.log('reject  '+fishId+' successfully');
                }else {
                    console.log('fail to get');
                    console.log(err.message);
                }
            });

        });


        $("#add_new").on('click', function () {

            //User.getTransactionId();
            var fishId = $("#user-fishId").val();
            if(User.appType == "Logistics+company") {
                fishId = guid();
            }
            var index = $("#user-fishId").get(0).selectedIndex;
            var company = $("#user-company").val();
            var city = $("#user-city").val();
            var freshness = $("#user-freshness").val();
            var currentDate = formatDate(new Date);
            var idAndType = fishId + "_" + User.appType;

            var appIpfsHash = $("#user-ipfs").val();

            console.log("idAndType: "+idAndType);
            console.log("appIpfsHash:" + appIpfsHash);

            User.userInstance.addInfo.sendTransaction(User.appAdminAddress, fishId,idAndType, company, city, freshness,appIpfsHash,currentDate,function(error,result) {
                if(!error) {
                    console.log('add info :'+fishId+' successfully');
                    $("#fishId").html("fishId:"+ fishId);
                    $("#user-hash").attr("value", result);
                    $("#user-store").attr("disabled", false);
                }else {
                    console.log('fail to add info');
                    console.log(err.message);
                }
            });


        });

        $("#user-store").on('click', function () {

            var infoHash = $("#user-hash").val();
            var fishId = $("#fishId").html().split(":")[1];
            console.log("fishId xxx:"+fishId);
            var idAndType = fishId + "_" + User.appType;

            User.userInstance.saveHash(fishId,infoHash,User.appAdminAddress,idAndType,function(error,result) {
                if(!error) {
                    console.log('send fishId: ');
                    $("#user-store").attr("disabled", true);
                }else {
                    console.log('fail to send');
                    console.log(err.message);
                }
            });

        });


        $("#send").on('click', function () {

            var fishId = $("#select-fishId").val();
            var sendEmail = $("#send-select").val();
            console.log("fishId: " + fishId);
            console.log("sendEmail: " + sendEmail);

            User.userInstance.sendToEmail(User.appInfoAddress,sendEmail,fishId,function(error,result) {
                if(!error) {
                    console.log('send to Email: '+sendEmail+' successfully');
                    $("#send").attr("disabled",false);
                }else {
                    console.log('fail to send');
                    console.log(err.message);
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



        $("#select-fishId").on('click',function() {
            var fishId = $("#select-fishId").val();

            User.userInstance.getInfo(fishId, function (error,result) {
                if(!error) {
                    console.log("select fishId");
                    $("#user-result-company").val(result[0]);
                    $("#user-result-city").attr("value",result[1]);
                    $("#user-result-freshness").val(result[2]);
                    $("#user-result-ipfs").attr("value",result[3]);
                    $("#user-result-time").attr("value",result[4]);

                    if(result[7] == 0) {
                        $("#user-result-id").attr("value","no input for transaction ID");
                    }else {
                        $("#user-result-id").attr("value",result[7]);
                    }
                    console.log(result[5]+"##" + result[6]);
                    if(result[5] == false) {
                        $("#user-result-isSent").attr("value","ready to send");
                        $("#send").attr("disabled",false);

                    }else {
                        $("#user-result-isSent").attr("value","sent");
                        $("#send").attr("disabled",true);
                    }

                    return User.getNextEmailIndex();

                }else {
                    console.log('fail to obtain info');
                    console.log(error.message);
                }



            })
        });

    },


    getRequest: function() {
        var url = location.search; //获取url中"?"符后的字串
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            App.appEmail=unescape(strs[0].split("=")[1]);
            App.appPassword=unescape(strs[1].split("=")[1]);
            console.log(App.appEmail);
        }
    },

    getFishInfo: function(fishId) {
        User.userInstance.getInfo(fishId, function(error, result){
            if(!error) {
                console.log('get info '+fishId+' successfully');

            }else {
                console.log('fail to add info');
                console.log(err.message);
            }
        });
    },

    getRequest: function() {
        console.log("User getRequest");
        var url = location.search; //获取url中"?"符后的字串
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            User.appEmail=unescape(strs[0].split("=")[1]);
            User.appAddress=unescape(strs[1].split("=")[1]);
            User.appType=unescape(strs[2].split("=")[1]);
            User.appCompanies=unescape(strs[3].split("=")[1]);
            User.appInfoAddress=unescape(strs[4].split("=")[1]);
            User.appAdminAddress=unescape(strs[5].split("=")[1]);
        }
        console.log("User appAdminAddress: " + User.appAdminAddress);
    },

    initAttributes: function() {

        if(User.appType == "Logistics+company") {
            $("#user-fishId").hide();
            $("#reject").hide();
            $("#user-company").attr("placeholder","please input the seafood fishing company name.");
        }else if(User.appType == "Restaurant") {
            $("#fishId").hide();
            $("#user-company").attr("placeholder","please input the logistics company name.");
        }else {
            $("#fishId").hide();
            $("#user-result-isSent").hide();
            $("#send").hide();
            $("#send-select").hide();
            $("#user-company").attr("placeholder","please input the restaurant name.");
        }



    },

    initUserIndex: function() {
        User.userInstance.getIndex(function(error, result){
            if(!error) {
                User.appIndex = result[0];
                console.log('appIndex: '+ result[0]);
                console.log('email: '+ result[1]);
                console.log('companyType: '+ result[2]);
                console.log('msg.sender: '+ result[3]);
                console.log('accepted: '+ result[4]);
                User.appAccepted = result[4];
                //console.log('block number: '+ result[5]);
               // User.appBlockNumber = result[5];
               // console.log("appBlockNumber:"+User.appBlockNumber);

                $("#select-fishId").empty();

                for(var i = 0; i < User.appIndex; i++) {
                    User.userInstance.getFishIdList(i,function (error,result) {
                        console.log("fishId: " + result);
                        $(".select-fishId").append('<option>' + result + '</option>');
                    });
                }

                return User.initAccepted();

            }else {
                console.log('fail to get index');
                console.log(err.message);
            }
        });


    },

    initAccepted: function() {
        //console.log(User.appAccepted);
        var temp = "";
        for(var i = 0; i < User.appAccepted; i++) {
            User.userInstance.getAcceptedFishInfo(i,function (error,result) {
                console.log("getAcceptedFishInfo: " + result);

                if((result[1] != true) && (temp != result[0] )) {
                    $(".send-select-fishId").append('<option>' + result[0] + '</option>');
                }
                temp = result[0];
            });
        }

    },



    getNextEmailIndex: function() {

        $("#send-select").empty();
        if(User.appType == "Logistics+company") {
            var initIndex = 0;
        }else if(User.appType == "Restaurant") {
            var initIndex = 100;
        }
        for(;initIndex < User.appCompanies; initIndex++) {
            console.log("getNextEmailIndex: ");

            User.userInstance.getEmail(User.appInfoAddress,initIndex, function(error, result) {
                if(!error) {
                    $(".select-email").append('<option>' + result + '</option>');
                }
            });
        }

    },



};

$(function() {
    $(window).load(function() {
        User.init();
    });
    $("#select-fishId").trigger("onchange");
});

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

var formatDate = function (date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    var minute = date.getMinutes();
    minute = minute < 10 ? ('0' + minute) : minute;
    var second= date.getSeconds();
    second = minute < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d+' '+h+':'+minute+':'+ second;
};
