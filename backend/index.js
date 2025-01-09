const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());

const STRAPI_API = process.env.STRAPI_API;
const STRAPI_KEY = process.env.STRAPI_KEY;

const getAllCoupons = async () => {
  try {
    const response = await axios.get(`${STRAPI_API}/coupons`, {
      headers: { Authorization: `Bearer ${STRAPI_KEY}` },
    });
    return response.data.data;
  } catch (error) {
    console.error('获取优惠券失败:', error);
    throw new Error('无法获取优惠券数据');
  }
};

/**
 * This is the API designed or the Coupon System frontend, to validate Coupon by its Hash code
 * @params hash -> the hash value for validation check
 * @returns status -> the status of recorded coupon with that Hash, 'invalid' for hash not found
 * @returns message -> Chinese explation for the status and for viewing in frontend
 */
app.post('/validate-coupon', async (req, res) => {
  const { hash } = req.body;

  if (!hash) {
    return res.status(400).json({ status: 'invalid', message: '无效请求' });
  }

  try {
    const coupons = await getAllCoupons();
    const coupon = coupons.find((item) => item.Hash === hash);

    console.log(coupons);

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
      message: '[优惠券有效',
      title: coupon.Title,
      description: coupon.Description,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', message: '服务器错误' });
  }
});

/**
 * This is the API designed or the Coupon System frontend, to use Coupon by its Hash code from the provider's QR scan
 * @params hash -> the hash value for use
 * @returns message -> Chinese explation for the successful or not and for viewing in frontend
 */
app.post('/use-coupon', async (req, res) => {
  const { hash } = req.body;

  if (!hash) {
    return res.status(400).json({ message: '无效二维码' });
  }

  try {
    const coupons = await getAllCoupons();
    const couponData = coupons.find((item) => item.Hash === hash);

    if (!couponData) {
      return res.status(404).json({ message: '无效二维码' });
    }

    console.log(`Coupon Found with ID ${couponData.documentId}: `, couponData);

    const couponId = couponData.documentId;
    const coupon = couponData;

    const updatedUsesLeft = coupon.UsesLeft - 1;

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

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
