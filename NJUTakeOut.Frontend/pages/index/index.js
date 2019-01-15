var app = getApp();
Page({
  data: {
    list: [], //传输过来的数据
    eventList: [],
    showList: [], //搜索数据
    orderList: [], //订单数据
    inputShowed: false,
    inputVal: "",
    dialogIsHiden: true,
    loginDialogIsHiden: true,
    specialChoices: [],
    commodityNum: 0,
    commodityTotalPrice: 0.00,
    selectedFoodName:"",
    selectedFoodId: 0,
    cartDialogHidden: true,
    portScrollPos:[],
    portNameHeight: 28,
    foodItemHeight: 117,
    headerHeight: 76
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.onLoad();
    //模拟加载
    wx.hideNavigationBarLoading(); //完成停止加载
    wx.stopPullDownRefresh(); //停止下拉刷新
  },

  onLoad: function(options) {
    var that = this;
    wx.request({
      url: app.globalData.backendUrl + "customer/event",
      header: {
        'Authorization': 'Bearer ' + app.getToken(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'GET',
      success: (res) => {
        var eventList = res.data.eventList;
        that.setData({
          eventList: eventList
        })
      }
    })
    wx.request({
      url: app.globalData.backendUrl + "food",
      header: {
        'Authorization': 'Bearer ' + app.getToken(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'GET',
      success: (res) => {
        
        // 记录每一个档口的位置
        var list = res.data.portItemList;
        var height = this.data.headerHeight;
        var tempHeightList = [];
        tempHeightList.push(height);
        for (var i = 0; i < list.length; i++) {
          height += (this.data.portNameHeight + this.data.foodItemHeight * list[i].foods.length);
          tempHeightList.push(height);
        }

        that.setData({
          list: res.data.portItemList,
          portScrollPos: tempHeightList
        })
      }
    })

  },

  showInput: function() {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function() {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function() {
    this.setData({
      inputVal: ""
    });
  },

  search: function(e) {
    this.setData({
      inputVal: e.detail.value
    });
    var tempList = [];
    for (var i = 0; i < this.data.list.length; i++) {
      for (var j = 0; j < this.data.list[i].foods.length; j++) {
        if (this.data.list[i].foods[j].name.indexOf(this.data.inputVal) != -1) {
          tempList.push(this.data.list[i].foods[j]);
        }
      }
    }
    this.setData({
      showList: tempList
    })
  },

  /**
   * 选餐完成
   */
  completeChoose: function(e) {
    wx.setStorageSync("orderList", this.data.orderList);
    wx.setStorageSync("commodityTotalPrice", this.data.commodityTotalPrice);
    wx.navigateTo({
      url: "../order/order",
    })
  },

  findBtnPosition: function(id) {
    var position = id.split("_")[0];
    var name = id.split("_")[1];
    for (var i = 0; i < this.data.list.length; i++) {
      if (this.data.list[i].position == position && this.data.list[i].name == name) {
        return i;
      }
    }
  },

  showDialog: function(food) {
    var choices = food.choice;
    var specialChoices = [];
    for (var i = 0; i < choices.length; i++) {
      var tempChoice = {
        value: choices[i],
        selected: false
      };
      specialChoices.push(tempChoice)
    }
    this.setData({
      specialChoices: specialChoices,
      dialogIsHiden: false,
      selectedFoodId: food.id,
      selectedFoodName: food.name
    })
  },

  clickDialog: function(e) {
    var specialChoices = this.data.specialChoices;
    for (var i = 0; i < specialChoices.length; i++) {
      if (specialChoices[i].value == e.target.id) {
        specialChoices[i].selected = true;
      } else {
        specialChoices[i].selected = false;
      }
    }
    this.setData({
      specialChoices: specialChoices
    })
  },

  closeDialog: function() {
    this.setData({
      dialogIsHiden: true
    })
  },

  confirmDialog: function() {
    //添加至餐盘
    for (var i = 0; i < this.data.specialChoices.length; i++) {
      if (this.data.specialChoices[i].selected) {
        this.addFoodToCart(this.data.selectedFoodId, this.data.selectedFoodName, this.data.specialChoices[i].value);
        break;
      }
    }
    var foodPosition = this.findBtnPosition(this.data.selectedFoodId);
    var i = foodPosition[0];
    var j = foodPosition[1];
    var selectChangeTarget = "list[" + i + "].foods[" + j + "].orderNum";
    this.setData({
      [selectChangeTarget]: this.data.list[i].foods[j].orderNum + 1
    })
    this.updateTotalNum();
    this.closeDialog();
  },

  /**
   * 点击右侧档口导航栏
   */
  switchRightTab: function(e) {
    // 获取item的下标值  
    var desPos = this.data.portScrollPos[e.target.dataset.index];
    // 把点击到的某一项，设为当前index 
    wx.pageScrollTo({
      scrollTop: desPos,
      duration: 0
    })
  },

  bindMinus: function(e) {
    var foodPosition = this.findBtnPosition(e.target.id);
    var i = foodPosition[0];
    var j = foodPosition[1];
    var selectChangeTarget = "list[" + i + "].foods[" + j + "].orderNum";
    if (this.data.list[i].foods[j].orderNum >= 1) {
      this.setData({
        [selectChangeTarget]: this.data.list[i].foods[j].orderNum - 1
      })
      var orderList = this.data.orderList;
      var updatedOrderList = [];
      var isToMinus = true;
      for (var k = 0; k < orderList.length; k++) {
        if (this.data.list[i].foods[j].id == orderList[k].foodId && isToMinus) {
          isToMinus = false;
        } else {
          updatedOrderList.push(orderList[k]);
        }
      }
      this.setData({
        orderList: updatedOrderList
      })
      this.updateTotalNum();
    }
  },

  bindPlus: function(e) {
    var foodPosition = this.findBtnPosition(e.target.id);
    var i = foodPosition[0];
    var j = foodPosition[1];
    if (this.data.list[i].foods[j].hasChoice) {
      this.showDialog(this.data.list[i].foods[j]);
    } else {
      var selectChangeTarget = "list[" + i + "].foods[" + j + "].orderNum";
      this.setData({
        [selectChangeTarget]: this.data.list[i].foods[j].orderNum + 1
      })
      this.addFoodToCart(this.data.list[i].foods[j].id, this.data.list[i].foods[j].name, "");
    }
    this.updateTotalNum();
  },

  bindSearchMinus: function(e) {
    this.bindMinus(e);
    var foodPosition = this.findSearchBtnPosition(e.target.id);
    var selectChangeTarget = "showList[" + foodPosition + "]" + ".orderNum";
    this.setData({
      [selectChangeTarget]: this.data.showList[foodPosition].orderNum - 1
    })
    this.updateTotalNum();
  },

  bindSearchPlus: function(e) {
    this.bindPlus(e);
    var foodPosition = this.findSearchBtnPosition(e.target.id);
    var selectChangeTarget = "showList[" + foodPosition + "]" + ".orderNum";
    this.setData({
      [selectChangeTarget]: this.data.showList[foodPosition].orderNum + 1
    })
    this.updateTotalNum();
  },

  updateTotalNum: function() {
    var totalNum = 0;
    var totalPrice = 0;
    for (var i = 0; i < this.data.list.length; i++) {
      for (var j = 0; j < this.data.list[i].foods.length; j++) {
        totalNum += this.data.list[i].foods[j].orderNum;
        totalPrice += this.data.list[i].foods[j].orderNum * this.data.list[i].foods[j].price;
      }
    }
    this.setData({
      commodityNum: totalNum,
      commodityTotalPrice: totalPrice
    })
  },

  findSearchBtnPosition: function(id) {
    for (var i = 0; i < this.data.showList.length; i++) {
      if (this.data.showList[i].id == id) {
        return i;
      }
    }
  },

  addFoodToCart: function(foodId,name, specialChoice) {
    var order = {
      foodId: foodId,
      foodName: name,
      specialChoice: specialChoice
    }
    var tempList = this.data.orderList;
    tempList.push(order);
    this.setData({
      orderList: tempList
    })
  },

  findBtnPosition: function(id) {
    for (var i = 0; i < this.data.list.length; i++) {
      for (var j = 0; j < this.data.list[i].foods.length; j++) {
        if (this.data.list[i].foods[j].id == id) {
          return [i, j];
        }
      }
    }
  },

  /**
   * 进入食堂界面
   */
  startSupplying: function() {
    this.setData({
      loginDialogIsHiden: false
    })
  },

  setUsername: function(e) {
    this.setData({
      username: e.detail.value
    })
  },

  setPassword: function(e) {
    this.setData({
      password: e.detail.value
    })
  },

  closeLoginDialog: function() {
    this.setData({
      loginDialogIsHiden: true
    })
  },

  /**
   * 提交账号密码
   */
  confirmLoginDialog: function() {
    var that = this;
    //从后端服务器确认账号密码
    wx.request({
      url: app.globalData.backendUrl + "account/login",
      method: "GET",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        username: this.data.username,
        password: this.data.password
      },
      success: function(res) {
        if (res.statusCode == 200) {
          wx.setStorageSync("supplierToken", res.data.token);
          wx.navigateTo({
            url: "../supplier/home/home",
          })
          that.setData({
            loginDialogIsHiden: true
          })
        } else {
          wx.showToast({
            title: '密码错误'
          })
        }
      }
    })
  },
  
  /**
   * 进入食品信息界面
   */
  toFoodDetail:function(e){
    wx.navigateTo({
      url: '../food/food?id='+e.target.id,
    })
  },

  /**
   * 打开购物车
   */
  showCart(e){
    this.setData({
      cartDialogHidden: false
    })
  },

  /**
   * 清空购物车
   */
  emptyCart(e) {
    this.setData({
      cartDialogHidden: true,
      orderList: [],
      commodityNum: 0,
      commodityTotalPrice: 0.00
    })
    for(let i = 0; i<this.data.list.length ; i++) {
      let list = this.data.list;
      for (let j = 0; j < list[i].foods.length ;j++) {
        var selectChangeTarget = "list[" + i + "].foods[" + j + "].orderNum";
        this.setData({
          [selectChangeTarget]: 0
        })
      }
    }
  },

  /**
   * 关闭购物车modal
   */
  closeCart(e) {
    this.setData({
      cartDialogHidden: true
    })
  },

  /**
   * 删除购物车中的一个商品
   */
  deleteCartFood(e) {
    var deletePos = e.target.id;
    var foodId = this.data.orderList[deletePos].foodId;
    var info = this.getFoodInfo(foodId);
 
    var tempTarget = this.data.list[info.listPos].foods[info.foodPos].orderNum;
    var comNum = this.data.commodityNum;
    var selectChangeTarget = "list[" + info.listPos + "].foods[" + info.foodPos + "].orderNum";
    var totalPrice = (this.data.commodityTotalPrice - info.price).toFixed(1);
    var tempList = this.data.orderList;

    tempList.splice(deletePos,1);
    this.setData({
      orderList: tempList,
      commodityNum: comNum-1,
      [selectChangeTarget]: tempTarget-1,
      commodityTotalPrice: totalPrice
    })
  },

  /**
   * 根据食品id查找食品信息
   */
  getFoodInfo(foodId) {
    for(var i = 0; i<this.data.list.length;i++) {
      for(var j=0;j<this.data.list[i].foods.length;j++) {
        if (foodId === this.data.list[i].foods[j].id) {
          return {
            listPos: i,
            foodPos: j,
            price: this.data.list[i].foods[j].price
          };
        }
      }
    }
  },


});