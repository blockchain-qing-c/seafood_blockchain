var Info = artifacts.require("./InfoContract.sol");
var Admin = artifacts.require("./AdminContract.sol");

module.exports = function(deployer) {
    deployer.deploy(Info).then(()=>{
        return deployer.deploy(Admin);
    });
};
