const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const app = express();
require('dotenv').config();

const allowedOrigins = [
  'https://coupon.do360.com',
  'http://localhost:3000',
  'https://1club.world',
];

const corsOptions = {
  origin: function(origin, callback) {
    // 如果请求中没有 origin（如同域请求或非浏览器环境下的请求），直接允许
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors()); // 允许所有 OPTIONS 预检请求

app.use(bodyParser.json());

const STRAPI_API = process.env.STRAPI_API;
const STRAPI_KEY = process.env.STRAPI_KEY;

// Function that gets all coupons from backend for a specific username
const getAllCoupons = async (username) => {
  try {
    if (!username) {
      throw new Error('用户名未提供');
    }

    // Send request to backend with AssignedFrom filter
    const response = await axios.get(`${STRAPI_API}/coupons?filters[AssignedFrom][$eq]=${username}`, {
      headers: { Authorization: `Bearer ${STRAPI_KEY}` },
    });

    // Return filtered coupons data
    return response.data.data;
  } catch (error) {
    console.error('获取优惠券失败:', error);
    throw new Error('无法获取优惠券数据');
  }
};

// Function that formats and produce success logs
const logSuccess = (statusCode, message) => {
  console.log(`[CouponSys - ${statusCode} OK] ${message}.`);
}

/**
 * This is the API designed or the Coupon System frontend main page login
 * @params name -> the name for login
 * @params password -> the password to check match
 * @returns role -> the role of the login user if logged in successfully, 'none' for failure
 * @returns message -> Chinese explation for the status and for viewing in frontend
 */
app.post('/login', async (req, res) => {
  const {name, password} = req.body;

  if (!name || !password){
    return res.status(400).json({ role: 'none', message: 'Name/Password are both nessesary.' });
  }
  
  try {
    // Query Strapi for the account by name
    const response = await axios.get(`${STRAPI_API}/coupon-sys-accounts`, {
      headers: {
        Authorization: `Bearer ${STRAPI_KEY}`
      },
      params: {
        filters: {
          Name: {
            $eq: name
          }
        }
      }
    });

    const accounts = response.data.data;

    if (accounts.length === 0) {
      return res.status(404).json({ role: 'none', message: '用户不存在' });
    }

    if (accounts.length > 1) {
      console.error("More than 1 user with same name, please assist.");
      return res.status(404).json({ role: 'none', message: '存在多个用户实例，请联系技术组或电邮至john.du@do360.com' });
    }

    const account = accounts[0];

    // Check if the password matches
    if (account.Password === password) {
      return res.status(200).json({ role: account.Role, message: '登录成功' });
    } else {
      return res.status(401).json({ role: 'none', message: '密码错误' });
    }
  } catch (error) {
    console.error('Error during login process:', error);
    return res.status(500).json({ role: 'none', message: 'Internal server error.' });
  }

}); 

/**
 * This is the API designed or the Coupon System frontend, to validate Coupon by its Hash code
 * @params hash -> the hash value for validation check
 * @returns status -> the status of recorded coupon with that Hash, 'invalid' for hash not found
 * @returns message -> Chinese explation for the status and for viewing in frontend
 */
app.post('/validate-coupon', async (req, res) => {
  const { hash, username } = req.body;

  if (!hash || !username) {
    console.error("Missing Request Argument(s). Request aborted.");
    return res.status(400).json({ status: 'invalid', message: '无效请求，可能缺失请求内容' });
  }

  try {
    const coupons = await getAllCoupons(username);
    const coupon = coupons.find((item) => item.Hash === hash);

    if (!coupon) {
      return res.json({ status: 'invalid', message: '无效二维码' });
    }

    if (new Date(coupon.Expiry) < new Date()) {
      return res.json({ status: 'expired', message: '优惠券已过期' });
    }

    if (coupon.UsesLeft <= 0) {
      return res.json({ status: 'used', message: '优惠券已使用完毕' });
    }

    if (!coupon.Active) {
      return res.json({ status: 'inactive', message: '优惠券已失效' });
    }

    logSuccess(200, "Coupon Validation Passed");
    res.json({
      status: 'valid',
      message: '优惠券有效',
      title: coupon.Title,
      description: coupon.Description,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', message: '服务器错误' });
  }
});

/**
 * This is the API designed for the Coupon System frontend, to use Coupon by its Hash code from the provider's QR scan
 * @params hash -> the hash value for use
 * @params username -> the username of the user consuming the coupon
 * @returns message -> Chinese explanation for the successful or not and for viewing in frontend
 */
app.post('/use-coupon', async (req, res) => {
  const { hash, username } = req.body;

  if (!hash) {
    return res.status(400).json({ message: '无效二维码' });
  }

  try {
    // Step 1: Find the coupon by hash
    const coupons = await getAllCoupons(username);
    const couponData = coupons.find((item) => item.Hash === hash);

    if (!couponData) {
      return res.status(404).json({ message: '无效二维码' });
    }

    const couponId = couponData.documentId;
    const coupon = couponData;

    const updatedUsesLeft = coupon.UsesLeft - 1;

    // Step 2: Update the coupon's UsesLeft and Active status
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

    // Step 3: Find the user by username
    const userResponse = await axios.get(
      `${STRAPI_API}/coupon-sys-accounts?populate=ConsumptionRecord&filters[Name][$eq]=${username}`,
      {
        headers: { Authorization: `Bearer ${STRAPI_KEY}` },
      }
    );

    const user = userResponse.data.data[0];

    if (!user) {
      console.error("Missing User Specs, Request aborted.");
      return res.status(404).json({ message: '用户未找到，无法记录使用历史' });
    }

    const userId = user.documentId;
    const consumptionRecord = user.ConsumptionRecord || []; // 获取现有的记录
    const sanitizedConsumptionRecord = consumptionRecord.map((record) => {
      const { id, ...rest } = record; // 移除 id 字段
      return rest;
    });

    // Step 4: Add a new entry to ConsumptionRecord
    const newRecord = {
      Consumer: coupon.AssignedTo,
      Provider: coupon.AssignedFrom,
      Platform: 'CouponSystem',
      Time: new Date().toISOString(), 
      Amount: 1,
      AdditionalInfo: coupon.Title,
    };

    await axios.put(
      `${STRAPI_API}/coupon-sys-accounts/${userId}`,
      {
        data: {
          ConsumptionRecord: [...sanitizedConsumptionRecord, newRecord], // 添加新记录
        },
      },
      {
        headers: { Authorization: `Bearer ${STRAPI_KEY}` },
      }
    );

    logSuccess(200, `Coupon used successfully for ${coupon.title}`);
    res.json({ message: '优惠券使用成功，并记录到用户历史！' });
  } catch (error) {
    console.error('Error using coupon:', error.message);
    res.status(500).json({ message: '服务器错误' });
  }
});

/**
 * This is the API designed for creating a new coupon from a in/external system on API call
 * @params title -> the title for coupon
 * @params description -> short description for the coupon
 * @params expiry -> the exp date in yyyy-MM-dd
 * @params assigned_from -> who provides good/service with this coupon
 * @params assigned_to -> who owns this coupon
 * @returns couponStatus -> the status of created coupon; 'active' if successful
 * @returns QRdata -> the hash needed for creating QR Code, get from successful creation
 * @returns message -> natrual language describing situation for debugging and more
 */
app.post('/create-active-coupon', async (req, res) => {
  const {title, description, expiry, assigned_from, assigned_to } = req.body;

  if (!title || !expiry || !assigned_from || !assigned_to){
    return res.status(400).json({ couponStatus: 'fail', message: 'Title, Expiry Date, assigning info are nessesary.' });
  }

  const couponData = {
    data: {
      Title: title,
      Description: description || '',
      Expiry: expiry,
      AssignedFrom: assigned_from,
      AssignedTo: assigned_to,
      Active: true
    }
  };

  try {
    const strapiResponse = await fetch(`${STRAPI_API}/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_KEY}`
      },
      body: JSON.stringify(couponData)
    });

    const strapiResult = await strapiResponse.json();

    if (!strapiResponse.ok) {
      return res.status(strapiResponse.status).json({
        couponStatus: 'fail',
        message: strapiResult.error?.message || 'Failed to create coupon in Strapi.'
      });
    }

    const hash = strapiResult?.data?.Hash;
    return res.status(201).json({
      couponStatus: 'active',
      QRdata: hash,
      message: 'Coupon created successfully.'
    });
  } catch (error) {
    return res.status(500).json({
      couponStatus: 'fail',
      message: 'Server error: ' + error.message
    });
  }
});


const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
