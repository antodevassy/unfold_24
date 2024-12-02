// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Auction {
    address public owner;
    string public name = "Auction" ;
    struct Item{
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct Order{
        uint256 time;
        Item item;
    }
    struct Order_bid{
        uint256 time;
        Item item;
        uint256 price;
    }
    mapping (address => mapping(uint256 => Order_bid)) bid_orders;
    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping (address => mapping(uint256 => Order)) public orders;
    
    event Buy(address buyer,uint256 orderId,uint256 itemId);
    event List(string name,uint256 cost,uint256 quantity);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor () {
        name="Auction";
        owner = msg.sender;
    }
    function list(uint256 _id,
    string memory _name,
    string memory _category,
    string memory _image,
    uint256 _cost,
    uint256 _rating,
    uint256 _stock
    ) public onlyOwner{
        
        //create item struct
        Item memory item = Item(_id, _name, _category, _image,_cost,_rating,_stock);
        //save item struct in blockchain
        items[_id] = item;
        // emit on event
        emit List(_name,_cost,_stock);
    }
    //Buy products
    function buy(uint256  _id) public payable{
        Item memory item = items[_id];
        //require enough ether to buy item
        require(msg.value>=item.cost);
        //require item  stock>0
        require(item.stock >0);
        // create an order
        Order memory order = Order(block.timestamp, item);
        //save order to chain
        orderCount[msg.sender]++;
        orders[msg.sender][orderCount[msg.sender]] = order;
        //subtract quantity
        items[_id].stock = item.stock -1;
        //emit event
        emit Buy(msg.sender, orderCount[msg.sender],item.id);

    }
    function bid(uint256 price,uint256 id) public payable{
        Item memory item = items[id];
        //require enough ether to buy item
        require(msg.value>=item.cost);
        require(price>item.cost);
        item.cost = price;
        Order_bid memory order = Order_bid(block.timestamp, item, price);
        orderCount[msg.sender]++;
        bid_orders[msg.sender][orderCount[msg.sender]] = order;
    }
    //withdraw funds
    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}
