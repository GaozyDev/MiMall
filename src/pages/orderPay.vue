<template>
  <div class="order-pay">
    <order-header title="订单支付">
      <template v-slot:tip>
        <span>请谨防钓鱼链接或诈骗电话</span>
      </template>
    </order-header>
    <div class="wrapper">
      <div class="container">
        <div class="order-wrap">
          <div class="item-order">
            <div class="icon-succ" />
            <div class="order-info">
              <h2>订单提交成功！去付款喽~</h2>
              <p>
                请在
                <span>30分</span>内完成支付，超时后将取消订单
              </p>
              <p>收货信息：{{addressInfo}}</p>
            </div>
            <div class="order-total">
              <p class="sum-payable">
                应付总额：
                <span>{{payment}}</span>元
              </p>
              <p class="open-detail" @click="showDetail=!showDetail">
                订单详情
                <span class="icon-down" :class="{'up':showDetail}" />
              </p>
            </div>
          </div>
          <div class="item-detail" v-if="showDetail">
            <div class="item">
              <div class="detail-title">订单号：</div>
              <div class="detail-info theme-color">{{orderId}}</div>
            </div>
            <div class="item">
              <div class="detail-title">收货信息：</div>
              <div class="detail-info">{{addressInfo}}</div>
            </div>
            <div class="item good">
              <div class="detail-title">商品名称</div>
              <div class="detail-info">
                <ul>
                  <li v-for="(item, index) in orderDetail" :key="index">
                    <img v-lazy="item.productImage" />
                    {{item.productName}}
                  </li>
                </ul>
              </div>
            </div>
            <div class="item">
              <div class="detail-title">发票信息：</div>
              <div class="detail-info">电子发票 个人</div>
            </div>
          </div>
        </div>
        <div class="item-pay">
          <h3>选择以下支付方式付款</h3>
          <div class="pay-way">
            <p>支付平台</p>
            <div class="pay pay-ali" :class="{'checked':payType==1}" @click="paySubmit(1)"></div>
            <div class="pay pay-wechat" :class="{'checked':payType==2}" @click="paySubmit(2)"></div>
          </div>
        </div>
      </div>
    </div>
    <scan-pay-code v-if="showPay" @close="closePayModal" :img="payImg"></scan-pay-code>
    <modal
      title="支付确认"
      btnType="3"
      :showModal="showConfirmModal"
      sureText="查看订单"
      cancelText="未支付"
      @cancel="showConfirmModal=false"
      @submit="goOrderList"
    >
      <template v-slot:body>
        <p>您确认是否完成支付</p>
      </template>
    </modal>
  </div>
</template>
<script>
import { Message } from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import OrderHeader from "./../components/OrderHeader";
import QRCode from "qrcode";
import ScanPayCode from "./../components/ScanPayCode";
import Modal from "./../components/Modal";
export default {
  name: "order-pay",
  data() {
    return {
      orderId: this.$route.query.orderId,
      addressInfo: "",
      payment: 0,
      orderDetail: [],
      showDetail: false,
      payType: -1,
      showPay: false,
      payImg: "",
      showConfirmModal: false,
      T: ""
    };
  },
  components: {
    OrderHeader,
    ScanPayCode,
    Modal
  },
  mounted() {
    this.getOrderDetail();
  },
  methods: {
    getOrderDetail() {
      this.axios.get(`/orders/${this.orderId}`).then(res => {
        let item = res.shippingVo;
        this.addressInfo = `${item.receiverName} ${item.receiverMobile} ${item.receiverProvince} ${item.receiverCity} ${item.receiverDistrict} ${item.receiverAddress}`;
        this.payment = res.payment;
        this.orderDetail = res.orderItemVoList;
      });
    },
    paySubmit(payType) {
      this.payType = payType;
      if (payType == 1) {
        window.open(`/#/order/alipay?orderId=${this.orderId}`, "_blank");
      } else {
        this.axios
          .post("/pay", {
            orderId: this.orderId,
            orderName: "Vue高仿小米商城",
            amount: 0.01,
            payType: 2
          })
          .then(res => {
            QRCode.toDataURL(res.content)
              .then(url => {
                this.showPay = true;
                this.payImg = url;
                this.loopOrderState();
              })
              .catch(() => {
                Message.error("微信二维码生成失败，请稍后重试");
              });
          });
      }
    },
    closePayModal() {
      this.showPay = false;
      this.showConfirmModal = true;
      clearInterval(this.T);
    },
    loopOrderState() {
      this.T = setInterval(() => {
        this.axios.get(`/orders/${this.orderId}`).then(res => {
          if (res.status == 20) {
            clearInterval(this.T);
            this.goOrderList();
          }
        });
      }, 1000);
    },
    goOrderList() {
      this.$router.push("/order/list");
    }
  }
};
</script>
<style lang="scss">
.order-pay {
  .wrapper {
    background-color: #f5f5f5;
    padding-top: 30px;
    padding-bottom: 60px;
    .order-wrap {
      padding: 60px 50px;
      background-color: #ffffff;
      font-size: 14px;
      margin-bottom: 30px;
      .item-order {
        display: flex;
        align-items: center;
        .icon-succ {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: url("/imgs/icon-gou.png") #80c58a no-repeat center;
          background-size: 60px;
          margin-right: 40px;
        }
        .order-info {
          margin-right: 250px;
          h2 {
            font-size: 24px;
            color: #333333;
            margin-bottom: 20px;
          }
          p {
            color: #666666;
            span {
              color: #ff6600;
            }
          }
        }
        .order-total {
          .sum-payable {
            margin-bottom: 30px;
            span {
              font-size: 28px;
              color: #ff6600;
            }
          }
          .open-detail {
            cursor: pointer;
            .icon-down {
              display: inline-block;
              width: 14px;
              height: 10px;
              background: url("/imgs/icon-down.png") no-repeat center;
              background-size: contain;
              margin-left: 10px;
              transition: all 0.5s;
              &.up {
                transform: rotate(180deg);
              }
            }
          }
        }
      }
      .item-detail {
        border-top: 1px solid #d7d7d7;
        padding-top: 50px;
        padding-left: 130px;
        font-size: 14px;
        margin-top: 45px;
        .item {
          margin-bottom: 20px;
          .detail-title {
            float: left;
            width: 100px;
          }
          .detail-info {
            display: inline-block;
            img {
              width: 30px;
              vertical-align: middle;
            }
          }
        }
      }
    }
    .item-pay {
      padding: 26px 50px 72px;
      background-color: #ffffff;
      color: #333333;
      h3 {
        font-size: 20px;
        font-weight: 200;
        color: #333333;
        padding-bottom: 24px;
        border-bottom: 1px solid #d7d7d7;
        margin-bottom: 26px;
      }
      .pay-way {
        font-size: 18px;
        .pay {
          display: inline-block;
          width: 190px;
          height: 64px;
          border: 1px solid #d7d7d7;
          cursor: pointer;
          &:last-child {
            margin-left: 20px;
          }
          &.checked {
            border: 1px solid #ff6600;
          }
        }
        .pay-ali {
          background: url("/imgs/pay/icon-ali.png") no-repeat center;
          background-size: 103px 38px;
          margin-top: 20px;
        }
        .pay-wechat {
          background: url("/imgs/pay/icon-wechat.png") no-repeat center;
          background-size: 103px 38px;
        }
      }
    }
  }
}
</style>