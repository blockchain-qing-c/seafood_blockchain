pragma solidity ^0.5.0;

contract AdminContract {

    struct AdminInfo{
        string _email;
        string _company;
        string _city;
        string _freshness;
        string _ipfs;
        string _time;
    }

    //string a = "aaaaa";

    mapping(string => AdminInfo) adminInfoMap;

    mapping(string => bytes32) public transactionIdMap;

    function addInfo(string memory idAndType, string memory email, string memory company, string memory city, string memory freshness,string memory ipfs, string memory time) public{

        AdminInfo memory info = AdminInfo(email, company,city, freshness, ipfs, time);

        adminInfoMap[idAndType] = info;



    }
    function getInfo(string memory idAndType)public view returns (string memory, string memory, string memory, string memory, string memory,string memory, bytes32) {

        AdminInfo memory info = adminInfoMap[idAndType];
        bytes32 hash = transactionIdMap[idAndType];

        return (info._email, info._company, info._city, info._freshness,info._ipfs, info._time, hash);

    }

    function saveHash(string memory fishId, bytes32 hash) public {
        transactionIdMap[fishId] = hash;
    }


}