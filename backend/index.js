const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
require('dotenv').config();

app.use(bodyParser.json());
console.log(process.env.PORT);
const STRAPI_API = process.env.STRAPI_API; // Strapi API 端口
const STRAPI_KEY = process.env.STRAPI_KEY; // Strapi API Token

// 验证优惠券
app.post('/validate-coupon', async (req, res) => {
  const { hash } = req.body;

  if (!hash) {
    return res.status(400).json({ status: 'invalid', message: '无效二维码' });
  }

  try {
    const response = await axios.get(`${STRAPI_API}/coupons?filters[Hash][$eq]=${hash}`, {
      headers: { Authorization: `Bearer ${STRAPI_KEY}` },
    });

    const coupon = response.data.data[0]?.attributes;

    if (!coupon) {
      return res.status(404).json({ status: 'invalid', message: '无效二维码' });
    }

    if (!coupon.Active) {
      return res.json({ status: 'inactive', message: '优惠券已失效' });
    }

    if (new Date(coupon.Expiry) < new Date()) {
      return res.json({ status: 'expired', message: '优惠券已过期' });
    }

    if (coupon.UsesLeft <= 0) {
      return res.json({ status: 'used', message: '优惠券已使用完毕' });
    }

    res.json({
      status: 'valid',
      message: '优惠券有效',
      title: coupon.Title,
      description: coupon.Description,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: '服务器错误' });
  }
});

// 确认使用优惠券
app.post('/use-coupon', async (req, res) => {
  const { hash } = req.body;

  if (!hash) {
    return res.status(400).json({ message: '无效二维码' });
  }

  try {
    const response = await axios.get(`${STRAPI_API}/coupons?filters[Hash][$eq]=${hash}`, {
      headers: { Authorization: `Bearer ${STRAPI_KEY}` },
    });

    const couponId = response.data.data[0]?.id;
    const coupon = response.data.data[0]?.attributes;

    if (!coupon) {
      return res.status(404).json({ message: '无效二维码' });
    }

    const updatedUsesLeft = coupon.UsesLeft - 1;

    // 更新优惠券信息
    await axios.put(
      `${STRAPI_API}/coupons/${couponId}`,
      {
        data: {
          UsesLeft: updatedUsesLeft,
          Active: updatedUsesLeft <= 0 ? false : coupon.Active,
        },
      },
      {
        headers: { Authorization: `Bearer ${STRAPI_KEY}` },
      }
    );

    res.json({ message: '优惠券使用成功！' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
