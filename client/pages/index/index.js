//index.js
var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
var util = require('../../utils/util.js')



Page({
    data: {
        userInfo: {},
        logged: false,
        takeSession: false,
        dateType:"day",
        weightData: [
          { "date": 20180601, "weight": 140 },
          { "date": 20180602, "weight": 130 },
          { "date": 20180603, "weight": 120 },
          { "date": 20180604, "weight": null},
          { "date": 20180605, "weight": 130 },
          { "date": 20180606, "weight": 143 },
          { "date": 20180607, "weight": null},
          { "date": 20180608, "weight": 130 },
          { "date": 20180609, "weight": 93 },
          { "date": 20180610, "weight": 140 },
          { "date": 20180611, "weight": 130 },
          { "date": 20180612, "weight": 130 },
          { "date": 20180613, "weight": 120 },
          { "date": 20180614, "weight": null },
          { "date": 20180615, "weight": 130 },
          { "date": 20180616, "weight": 143 },
          { "date": 20180617, "weight": null },
          { "date": 20180618, "weight": 130 }
        ],
        requestResult: ''
    },

    /**
      * 生命周期函数--监听页面加载
      */
    onLoad: function (options) {
      // const ctx = wx.createCanvasContext('xyz');
      this.draw(this.data);
      
    },

    draw: function(data){
      var ctx = wx.createCanvasContext('xyz', this);
      var width,height=300;
      var originX = 22;
      var originY = 215;
      var map = data.weightData;
      
      //数据处理
      if(map.length==0){
        return;
      }
      //求最大最小值
      var minWeight,maxWeight;
      for(var i=0;i<map.length;i++){
        if(map[i].weight==null){
          continue;
        }
        if(minWeight==null){
          minWeight=map[i].weight;
        }
        if (maxWeight == null) {
          maxWeight = map[i].weight;
        }
        
        if(minWeight>map[i].weight){
          minWeight=map[i].weight;
        }
        if(maxWeight<map[i].weight){
          maxWeight=map[i].weight;
        }
      }
      console.log('最小:'+minWeight+'； 最大:'+maxWeight);
      //求坐标最大最小值
      var minY = Math.floor(minWeight/10)*10;
      var maxY = Math.ceil(maxWeight/10)*10;
      console.log("坐标Y最小:"+minY+"; 最大:"+maxY);
      //求坐标步幅
      var stepY = 5;

      //获取屏宽
      wx.getSystemInfo({
        success: function(res) {
          width=res.windowWidth;
          height = res.windowHeight;
          console.log('屏幕宽度:'+width+'; 屏幕高度:'+height);
        },
      })
      var ratioX=parseInt((width-60)/15);
      var ratioY=stepY*3;
      

      //绘制坐标
      ctx.beginPath();
      for(var i=0;i<=(maxY-minY)/stepY;i++){
        
        ctx.save();
        ctx.setStrokeStyle("#dde2e3");
        ctx.setFillStyle("#848198");
        ctx.setFontSize("8");
        ctx.fillText(i*stepY+minY,5,originY+5-i*ratioY);
        ctx.moveTo(originX,originY-i*ratioY);
        ctx.lineTo((width-30),originY-i*ratioY);
        ctx.stroke();
        ctx.restore();
      }

      // //绘制图例
      // for(var i=0;i<map.length;i++){
      //   ctx.save();
      //   ctx.translate(15,215);
      //   ctx.beginPath();
      //   ctx.setLineCap("round");
      //   ctx.setLineWidth(1);
      //   ctx.moveTo(22+i*38,46);
      //   ctx.lineTo(38+i+38,46);
      //   ctx.stroke();
      //   ctx.setFontSize('8');
      //   ctx.setFillStyle('#000000');
      //   ctx.fillText(map[i].date,21+i*50,66);
      //   ctx.restore();
      // }
      //横坐标
      for(var i=0;i<(map.length);i++){
        ctx.save();
        ctx.translate(15,215);
        ctx.setFontSize('8');
        ctx.setFillStyle('#006600');
        var str = map[i].date+'';
        ctx.fillText(str.substr(4),i*ratioX,20);
        ctx.restore();
      }
      
      //绘制折线
      ctx.beginPath();
      ctx.save();
      ctx.translate(22,215);
      ctx.moveTo(0,-(map[0].weight-minY)/stepY*ratioY);
      for(var i=1;i<map.length;i++){
        ctx.setStrokeStyle('#0000FF');
        if(map[i].weight==null){
          continue;
        }
        ctx.lineTo(i * ratioX, -(map[i].weight-minY)/stepY*ratioY);
        
        // originY - i * ratioY
        console.log((map[i].weight - minY)/stepY);
      }
      ctx.stroke();
      ctx.restore();
      ctx.draw();
    },


    // 用户登录示例
    login: function() {
        if (this.data.logged) return

        util.showBusy('正在登录')
        var that = this

        // 调用登录接口
        qcloud.login({
            success(result) {
                if (result) {
                    util.showSuccess('登录成功');
                    that.setData({
                        userInfo: result,
                        logged: true
                    })
                } else {
                    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                    qcloud.request({
                        url: config.service.requestUrl,
                        login: true,
                        success(result) {
                            util.showSuccess('登录成功')
                            that.setData({
                                userInfo: result.data.data,
                                logged: true
                            })
                        },

                        fail(error) {
                            util.showModel('请求失败', error)
                            console.log('request fail', error)
                        }
                    })
                }
            },

            fail(error) {
                util.showModel('登录失败', error)
                console.log('登录失败', error)
            }
        })
    },

    bindGetUserInfo: function (e) {
      if (this.data.logged) return;

      util.showBusy('正在登录');

      var that = this;
      var userInfo = e.detail.userInfo;

      // 查看是否授权
      wx.getSetting({
        success: function (res) {
          if (res.authSetting['scope.userInfo']) {

            // 检查登录是否过期
            wx.checkSession({
              success: function () {
                // 登录态未过期
                util.showSuccess('登录成功');
                that.setData({
                  userInfo: userInfo,
                  logged: true
                })
              },

              fail: function () {
                qcloud.clearSession();
                // 登录态已过期，需重新登录
                var options = {
                  encryptedData: e.detail.encryptedData,
                  iv: e.detail.iv,
                  userInfo: userInfo
                }
                that.doLogin(options);
              },
            });
          } else {
            util.showModel('用户未授权', e.detail.errMsg);
          }
        }
      });
    },

    doLogin: function(options) {
      var that = this;

      wx.login({
        success: function (loginResult) {
          var loginParams = {
            code: loginResult.code,
            encryptedData: options.encryptedData,
            iv: options.iv,
          }
          qcloud.requestLogin({
            loginParams, success() {
              util.showSuccess('登录成功');

              that.setData({
                userInfo: options.userInfo,
                logged: true
              })
            },
            fail(error) {
              util.showModel('登录失败', error)
              console.log('登录失败', error)
            }
          });
        },
        fail: function (loginError) {
          util.showModel('登录失败', loginError)
          console.log('登录失败', loginError)
        },
      });
    },

    // 切换是否带有登录态
    switchRequestMode: function (e) {
        this.setData({
            takeSession: e.detail.value
        })
        this.doRequest()
    },

    doRequest: function () {
        util.showBusy('请求中...')
        var that = this
        var options = {
            url: config.service.requestUrl,
            login: true,
            success (result) {
                util.showSuccess('请求成功完成')
                console.log('request success', result)
                that.setData({
                    requestResult: JSON.stringify(result.data)
                })
            },
            fail (error) {
                util.showModel('请求失败', error);
                console.log('request fail', error);
            }
        }
        if (this.data.takeSession) {  // 使用 qcloud.request 带登录态登录
            qcloud.request(options)
        } else {    // 使用 wx.request 则不带登录态
            wx.request(options)
        }
    },

    // 上传图片接口
    doUpload: function () {
        var that = this

        // 选择图片
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: function(res){
                util.showBusy('正在上传')
                var filePath = res.tempFilePaths[0]

                // 上传图片
                wx.uploadFile({
                    url: config.service.uploadUrl,
                    filePath: filePath,
                    name: 'file',

                    success: function(res){
                        util.showSuccess('上传图片成功')
                        console.log(res)
                        res = JSON.parse(res.data)
                        console.log(res)
                        that.setData({
                            imgUrl: res.data.imgUrl
                        })
                    },

                    fail: function(e) {
                        util.showModel('上传图片失败')
                    }
                })

            },
            fail: function(e) {
                console.error(e)
            }
        })
    },

    // 预览图片
    previewImg: function () {
        wx.previewImage({
            current: this.data.imgUrl,
            urls: [this.data.imgUrl]
        })
    },

    // 切换信道的按钮
    switchChange: function (e) {
        var checked = e.detail.value

        if (checked) {
            this.openTunnel()
        } else {
            this.closeTunnel()
        }
    },

    openTunnel: function () {
        util.showBusy('信道连接中...')
        // 创建信道，需要给定后台服务地址
        var tunnel = this.tunnel = new qcloud.Tunnel(config.service.tunnelUrl)

        // 监听信道内置消息，包括 connect/close/reconnecting/reconnect/error
        tunnel.on('connect', () => {
            util.showSuccess('信道已连接')
            console.log('WebSocket 信道已连接')
            this.setData({ tunnelStatus: 'connected' })
        })

        tunnel.on('close', () => {
            util.showSuccess('信道已断开')
            console.log('WebSocket 信道已断开')
            this.setData({ tunnelStatus: 'closed' })
        })

        tunnel.on('reconnecting', () => {
            console.log('WebSocket 信道正在重连...')
            util.showBusy('正在重连')
        })

        tunnel.on('reconnect', () => {
            console.log('WebSocket 信道重连成功')
            util.showSuccess('重连成功')
        })

        tunnel.on('error', error => {
            util.showModel('信道发生错误', error)
            console.error('信道发生错误：', error)
        })

        // 监听自定义消息（服务器进行推送）
        tunnel.on('speak', speak => {
            util.showModel('信道消息', speak)
            console.log('收到说话消息：', speak)
        })

        // 打开信道
        tunnel.open()

        this.setData({ tunnelStatus: 'connecting' })
    },

    /**
     * 点击「发送消息」按钮，测试使用信道发送消息
     */
    sendMessage() {
        if (!this.data.tunnelStatus || !this.data.tunnelStatus === 'connected') return
        // 使用 tunnel.isActive() 来检测当前信道是否处于可用状态
        if (this.tunnel && this.tunnel.isActive()) {
            // 使用信道给服务器推送「speak」消息
            this.tunnel.emit('speak', {
                'word': 'I say something at ' + new Date(),
            });
        }
    },

    /**
     * 点击「关闭信道」按钮，关闭已经打开的信道
     */
    closeTunnel() {
        if (this.tunnel) {
            this.tunnel.close();
        }
        util.showBusy('信道连接中...')
        this.setData({ tunnelStatus: 'closed' })
    }
})
