pragma solidity ^0.5.0;
import "./AdminContract.sol";

contract InfoContract {

    mapping(string => UserContract) userList;
    mapping(string => string) accountList;
    mapping(uint => string) accountsList;

    uint restaurant = 0;
    uint customer = 100;

    function createUser(string memory email, string memory password, string memory companyType, address accountAddress) public{
        UserContract user = new UserContract(email, companyType, accountAddress);
        accountList[email] = password;
        userList[email] = user;
        if(keccak256(abi.encodePacked(companyType)) == keccak256(abi.encodePacked("Restaurant"))) {
            accountsList[restaurant] = email;
            restaurant++;
        }else if(keccak256(abi.encodePacked(companyType)) == keccak256(abi.encodePacked("Customer"))) {
            accountsList[customer] = email;
            customer++;
        }

    }

    function login(string memory email, string memory password) public view returns(address, string memory, uint, address) {
        uint temp = 1024;
        if(keccak256(abi.encodePacked(accountList[email])) == keccak256(abi.encodePacked(password))) {
            UserContract user = userList[email];

            if(user.getAccountAddress() == msg.sender) {
                if(keccak256(abi.encodePacked(user.getCompanyType())) == keccak256(abi.encodePacked("Restaurant")))
                    return ( address(user), user.getCompanyType(),customer, address(this));
                else if(keccak256(abi.encodePacked(user.getCompanyType())) != keccak256(abi.encodePacked("Customer")))
                    return (address(user), user.getCompanyType(), restaurant, address(this));
                else
                    return (address(user), user.getCompanyType(),temp, address(this));
            }else {
                return (address(user), " ", temp, address(this));
            }

        }else {
            return (address(0),"404", temp, address(this));
        }

    }

    function admin() public view returns(address) {
        return msg.sender;
    }

    function getEmail(uint index)public view returns(string memory ) {
        return accountsList[index];
    }

    function getAddress(string memory email )public view returns(address) {
        UserContract user = userList[email];
        return address(user);
    }

}



contract UserContract {

    struct Info {
            string fishId;
            string companyInfo;
            string city;
            string freshness;
            string ipfs;
            string time;
    }
    mapping(string => bool[]) public isSentMap;
    mapping(string => bytes32) public transactionIdMap;

    //event Detail(string fishId, string ipfs, string time,  bytes32 hash);

    mapping(uint => string) public acceptedIdList;
    mapping(string => string) public fishIdEmailMap;
    mapping(string => bool) public fishIdIsUsedMap;
    uint _accepted = 0;

    mapping(uint => string) public fishIdList;
    uint _index = 0;

    string _email;
    string _companyType;
    address _accountAddress;

    constructor(string memory email, string memory companyType, address accountAddress) public {
        _email = email;
        _companyType = companyType;
        _accountAddress = accountAddress;
    }

    mapping(string => Info) infoList;

    //AdminContract admin = AdminContract(0xC190892d9dD560AcFb26870fb920d048acb4D523);
    //InfoContract _info = InfoContract(0xCB7D81431576984e494e1294dff3E023b22Ce407);

    // add info
        function addInfo(address adminAddress, string memory fishId, string memory idAndType, string memory company, string memory city, string memory freshness,string memory ipfs, string memory time) public{

            Info memory info = Info(fishId, company,city,freshness,ipfs, time);
            infoList[fishId] = info;
            isSentMap[fishId].push(false);

            fishIdList[_index] = fishId;
            _index++;

            fishIdIsUsedMap[fishId] = true;

            AdminContract admin = AdminContract(adminAddress);
            admin.addInfo(idAndType, _email, company, city,freshness,ipfs,  time);

        }

        function getIndex() public view returns(uint, string memory, string memory, address, uint, uint) {
            return (_index, _email,_companyType, msg.sender, _accepted, block.number);
        }

        function getFishIdList(uint index) public view returns(string memory) {
            return fishIdList[index];
        }


        function getInfo(string memory fishId) public view returns (string memory, string memory, string memory,string memory, string memory, bool, uint, bytes32) {
            Info memory info = infoList[fishId];
            uint i = isSentMap[fishId].length - 1;
            bool isSent = isSentMap[fishId][i];
            bytes32 hash = transactionIdMap[fishId];
            return (info.companyInfo, info.city, info.freshness, info.ipfs, info.time, isSent, i, hash);
        }

        function getCompanyType() public view returns(string memory) {
            return _companyType;
        }

        function getAccountAddress() public view returns(address ) {
            return _accountAddress;
        }

        function getEmail(address infoAddress, uint index) public view returns(string memory ) {
            InfoContract info = InfoContract(infoAddress);
            return info.getEmail(index);
        }

        function sendToEmail(address infoAddress,string memory email, string memory fishId) public{
            isSentMap[fishId].push(true);

            InfoContract info = InfoContract(infoAddress);
            address userAddress = info.getAddress(email);
            UserContract user = UserContract(userAddress);
            //addAccepted();
            //user.addAccepted();
            user.acceptFishId(fishId, _email);
            //return user.getCompanyType();

        }

        function getNextAll(address infoAddress, string memory email) public view returns(address, string memory,address, uint) {
            InfoContract info = InfoContract(infoAddress);
            address userAddress = info.getAddress(email);
            UserContract user = UserContract(userAddress);
            return (address(user), user.getCompanyType(),user.getAccountAddress(), user.getAccepted());
        }

        function getAccepted() public view returns(uint) {
            return _accepted;
        }

        function acceptFishId(string memory fishId, string memory email) public{
            acceptedIdList[_accepted] = fishId;
            fishIdEmailMap[fishId] = email;
            fishIdIsUsedMap[fishId] = false;
            _accepted++;
        }

        function getAcceptedFishInfo(uint accepted) public view returns(string memory,bool ) {
            string memory fishId = acceptedIdList[accepted];
            bool isUsed = fishIdIsUsedMap[fishId];
            return (fishId, isUsed);
        }

        function rejectFishId(address infoAddress,string memory fishId) public {
            InfoContract info = InfoContract(infoAddress);
            string memory email = fishIdEmailMap[fishId];

            fishIdIsUsedMap[fishId] = true;

            address userAddress = info.getAddress(email);
            UserContract user = UserContract(userAddress);
            user.changeInfoStatus(fishId, false);

        }

        function changeInfoStatus(string memory fishId, bool isSent) public {
            //Info memory info = infoList[fishId];
            isSentMap[fishId].push(isSent);
            //infoList[fishId] = Info(info.fishId, info.companyInfo,info.city,info.freshness,info.time);
        }

        function saveHash(string memory fishId, bytes32 hash, address adminAddress, string memory idAndType) public {
            transactionIdMap[fishId] = hash;
            AdminContract admin = AdminContract(adminAddress);
            admin.saveHash(idAndType, hash);
            emit();
        }

        function getHash(string memory fishId) public view returns (bytes32) {
            return transactionIdMap[fishId];
        }




}


