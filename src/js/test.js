const ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

var appIpfsHash = null;
var appBuffer = null;
const btn = document.querySelector('#user-upload');
const inputFile = document.querySelector('#user-file');

inputFile.addEventListener('change', function(event) {
    console.log(1)
    const file = event.target.files[0];
    console.log("file:"+file)
    console.log(2)
    var reader = new FileReader();
    console.log(3)
    reader.readAsArrayBuffer(file);
    console.log(4)
    reader.onload = function(event) {
        // 文件里的文本会在这里被打印出来
        console.log(5)
        //console.log(event.target.result)
        console.log(event.target.result);
        const buffer = Buffer.from(event.target.result);
        console.log(6)
        appBuffer = buffer;
        console.log(7)
    };
    console.log(8)
})

btn.addEventListener('click', async function (){

    console.log(9)
    await ipfs.add(appBuffer, function(error, ipfsHash) {
        console.log(10)
        console.log(error, ipfsHash);
        appIpfsHash = ipfsHash[0].hash;
        console.log(11)
        $("#user-ipfs").attr("value",appIpfsHash);
        $("#isUploaded").html("upload successfully");
    })
    console.log(12)

} );
