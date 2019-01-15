var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pictures: [],
    portName: '',
    name: '',
    amount: 0,
    price: '',
    description: '',
    hasSpecialChoice: false,
    specialChoices: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var id = options.id;
    var that = this;
    console.log(id);
    wx.request({
      url: app.globalData.backendUrl + "food/" + id,
      header: {
        'Authorization': 'Bearer ' + app.getToken(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'GET',
      success: (res) => {
        var choices = [];
        for (var i = 0; i < res.data.specialChoices.length; i++) {
          choices.push({
            index: i,
            value: res.data.specialChoices[i]
          })
        }
        that.setData({
          pictures: res.data.pictures,
          portName: res.data.portName,
          name: res.data.name,
          amount: res.data.amount,
          price: res.data.price,
          description: res.data.description,
          hasSpecialChoice: res.data.hasSpecialChoice,
          specialChoices: choices
        })
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

  },

  backToMenu: function() {
    wx.switchTab({
      url: "../index/index",
    })
  }
})