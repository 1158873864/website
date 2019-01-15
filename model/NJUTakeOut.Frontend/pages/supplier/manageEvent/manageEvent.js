var app = getApp();
var EventType = {
  FirstOrder: "FirstOrder",
  FullSubtraction: "FullSubtraction",
  ItemSubtraction: "ItemSubtraction",
  ItemSubtractionOnce: "ItemSubtractionOnce"
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: ["首单活动", "满减活动", "组合降价", "单品促销"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    commodities: [],
    dialogIsHiden: true,
    events: [],

    firstOrderMinusPrice: "",
    firstOrderDescription: "",

    fullSubtractionTargetPrice: "",
    fullSubtractionMinusPrice: "",
    fullSubtractionDescription: "",

    itemSubtractionMinusPrice: "",
    itemSubtractionDescription: "",

    itemSubtractionOnceMinusPrice: "",
    itemSubtractionOnceDescription: ""
  },

  closeDialog: function() {
    this.setData({
      dialogIsHiden: true
    })
  },

  addEvent: function() {
    this.setData({
      dialogIsHiden: false
    })
  },

  bindFirstOrderMinusPrice: function(e) {
    this.setData({
      firstOrderMinusPrice: e.detail.value
    })
  },

  bindFirstOrderDescription: function(e) {
    this.setData({
      firstOrderDescription: e.detail.value
    })
  },

  bindFullSubtractionTargetPrice: function(e) {
    this.setData({
      fullSubtractionTargetPrice: e.detail.value
    })
  },

  bindFullSubtractionMinusPrice: function(e) {
    this.setData({
      fullSubtractionMinusPrice: e.detail.value
    })
  },

  bindFullSubtractionDescription: function(e) {
    this.setData({
      fullSubtractionDescription: e.detail.value
    })
  },

  checkboxChange: function(e) {
    var data = this.data.commodities;
    var checkboxData = e.detail.value;
    for (var i = 0; i < this.data.commodities.length; i++) {
      if (checkboxData.indexOf(data[i].value) != -1) {
        data[i].checked = true;
      } else {
        data[i].checked = false;
      }
    }
    this.setData({
      commodities: data
    })
  },

  radioboxChange: function(e) {
    var data = this.data.commodities;
    var radioboxData = e.detail.value;
    for (var i = 0; i < this.data.commodities.length; i++) {
      if (radioboxData.indexOf(data[i].value) != -1) {
        data[i].checked = true;
      } else {
        data[i].checked = false;
      }
    }
    this.setData({
      commodities: data
    })
  },

  bindItemSubtractionMinusPrice: function(e) {
    this.setData({
      itemSubtractionMinusPrice: e.detail.value
    })
  },

  bindItemSubtractionDescription: function(e) {
    this.setData({
      itemSubtractionDescription: e.detail.value
    })
  },

  bindItemSubtractionOnceMinusPrice:function(e){
    this.setData({
      itemSubtractionOnceMinusPrice: e.detail.value
    })
  },

  bindItemSubtractionOnceDescription:function(e){
    this.setData({
      itemSubtractionOnceDescription: e.detail.value
    })
  },

  tabClick: function(e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },

  confirmAddDialog: function(e) {
    var that = this;

    var eventData = {};
    if (0 <= this.data.activeIndex & this.data.activeIndex < 1) {
      eventData = {
        eventType: EventType.FirstOrder,
        description: this.data.firstOrderDescription,
        minusPrice: parseFloat(this.data.firstOrderMinusPrice)
      }
    } else if (1 <= this.data.activeIndex & this.data.activeIndex < 2) {
      eventData = {
        eventType: EventType.FullSubtraction,
        description: this.data.fullSubtractionDescription,
        fullPrice: parseFloat(this.data.fullSubtractionFullPrice),
        minusPrice: parseFloat(this.data.fullSubtractionMinusPrice)
      }
    } else if (2 <= this.data.activeIndex & this.data.activeIndex < 3) {
      var items = [];
      var commodities = this.data.commodities;
      for (var i = 0; i < commodities.length; i++) {
        if (commodities[i].checked) {
          items.push(commodities[i].id);
        }
      }
      eventData = {
        eventType: EventType.ItemSubtraction,
        description: this.data.itemSubtractionDescription,
        itemList: items,
        minusPrice: parseFloat(this.data.itemSubtractionMinusPrice)
      }
    } else if (3 <= this.data.activeIndex & this.data.activeIndex < 4) {
      var commodities = this.data.commodities;
      for (var i = 0; i < commodities.length; i++) {
        if (commodities[i].checked) {
          eventData = {
            eventType: EventType.ItemSubtractionOnce,
            description: this.data.itemSubtractionOnceDescription,
            itemId: commodities[i].id,
            minusPrice: parseFloat(this.data.itemSubtractionOnceMinusPrice)
          }
        }
      }
    }

    wx.request({
      url: app.globalData.backendUrl + "supplier/event",
      header: {
        'Authorization': 'Bearer ' + app.getSupplierToken(),
        'content-type': 'application/json'
      },
      data: eventData,
      method: 'PUT',
      success: (res) => {
        if (res.statusCode == 200) {
          wx.showToast({
            title: "添加成功",
          })
          that.setData({
            dialogIsHiden: true
          })
          that.onLoad();
        }
      }
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.request({
      url: app.globalData.backendUrl + "supplier/event",
      header: {
        'Authorization': 'Bearer ' + app.getSupplierToken(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'GET',
      success: (res) => {
        that.setData({
          events: res.data.eventItems
        })
      }
    })

    wx.request({
      url: app.globalData.backendUrl + "supplier/event/food",
      header: {
        'Authorization': 'Bearer ' + app.getSupplierToken(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'GET',
      success: (res) => {
        that.setData({
          commodities: res.data.eventFoodItemList
        })
      }
    })
  },

  deleteEvent: function(e) {
    var that = this;
    wx.request({
      url: app.globalData.backendUrl + "supplier/event/" + e.target.id,
      header: {
        'Authorization': 'Bearer ' + app.getSupplierToken(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'DELETE',
      success: (res) => {
        if (res.statusCode == 200) {
          this.onLoad();
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }

})