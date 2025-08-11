const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const axios = require('axios');
const cors = require('cors');
const app = express();
require('dotenv').config();

const allowedOrigins = [
  'http://localhost:3000', // TODO: Del for Dev
  'http://localhost:3001',
  'http://localhost:3003',
  'http://localhost:5173', // TODO: Del
  'https://coupon.do360.com',
  'https://1club.world',
  'https://do360.com',
  'https://www.1club.world',  // www.
  'https://roseneathholidaypark.au',
  'https://world-cooperation.org',
];

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(bodyParser.json());

const STRAPI_API = process.env.STRAPI_API;
const STRAPI_KEY = process.env.STRAPI_KEY;
const EMAIL_API_ENDPOINT = process.env.EMAIL_API_ENDPOINT;

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

// Function that set coupon to inactivity
const deactivateCoupon = async (coupon) => {
  try {
    const couponId = coupon.documentId;
      await axios.put(
        `${STRAPI_API}/coupons/${couponId}`,
        {
          data: {
            Active: false
          },
        },
        {
          headers: { Authorization: `Bearer ${STRAPI_KEY}` },
        }
      );
  } catch (error) {
    console.error('更新优惠券为非活跃状态失败:', error);
    throw new Error('无法获取更新优惠券为非活跃');
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
      logSuccess(200, `User ${account.Name} logged in as ${account.Role}.`)
      return res.status(200).json({ role: account.Role, membershipField: account.MembershipField, message: '登录成功' });
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
  const { hash, provider } = req.body;

  if (!hash || !provider ) {
    console.error("Missing Request Argument(s). Request aborted.");
    return res.status(400).json({ status: 'invalid', message: '无效请求，可能缺失请求内容' });
  }

  try {
    // Send request to backend with Hash filter
    const response = await axios.get(`${STRAPI_API}/coupons?filters[Hash][$eq]=${hash}&filters[AssignedFrom][$eq]=${provider}`, {
      headers: { Authorization: `Bearer ${STRAPI_KEY}` },
    });

    const coupon = response.data?.data[0];

    if (!coupon || coupon == null || coupon == undefined) {
      console.log(`Got Coupon Hash ${hash}, not found in all coupons.`);
      return res.json({ status: 'invalid', message: '无效二维码' });
    }

    if (new Date(coupon.Expiry) < new Date()) {
      deactivateCoupon(coupon);
      console.log(`Got Coupon with Hash ${hash} is already expired.`);
      return res.json({ status: 'expired', message: '优惠券已过期' });
    }

    if (coupon.UsesLeft <= 0) {
      console.log(`Got Coupon with Hash ${hash} is already exausted.`);
      return res.json({ status: 'used', message: '优惠券已使用完毕' });
    }

    if (!coupon.Active) {
      console.log(`Got Coupon with Hash ${hash} is not active.`);
      return res.json({ status: 'inactive', message: '优惠券已失效' });
    }

    logSuccess(200, "Coupon Validation Passed");
    res.json({
      status: 'valid',
      message: 'Coupon is valid.',
      title: coupon.Title,
      description: coupon.Description
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', message: '服务器错误' });
  }
});

/**
 * This is the API designed for the Coupon System frontend, to use Coupon by its Hash code from the provider's QR scan
 * @params hash -> the hash value for use
 * @params username -> the account name of the Coupon Sys
 * @returns message -> Chinese explanation for the successful or not and for viewing in frontend
 */
app.post('/use-coupon', async (req, res) => {
  const { hash, username } = req.body;

  if (!hash) {
    return res.status(400).json({ message: '无效二维码' });
  }

  try {
    // Send request to backend with Hash filter
    const response = await axios.get(`${STRAPI_API}/coupons?filters[Hash][$eq]=${hash}&filters[AssignedFrom][$eq]=${username}`, {
      headers: { Authorization: `Bearer ${STRAPI_KEY}` },
    });

    const couponData = response.data?.data[0];

    if (!couponData || couponData == null || couponData == undefined || couponData.Active == false) {
      return res.status(404).json({ message: '无效二维码' });
    }

    if (new Date(couponData.Expiry) < new Date()){
      deactivateCoupon(couponData);
      return res.status(406).json({ message: '此券已过期' });
    }

    const couponId = couponData.documentId;
    const coupon = couponData;

    const updatedUsesLeft = coupon.UsesLeft - 1;

    // Update the coupon's UsesLeft and Active status
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

    // Find the user by username
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

    logSuccess(200, `[CouponSys] Coupon used successfully for ${coupon.title}`);
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
  const { title, description, expiry, assigned_from, assigned_to, email, contact } = req.body;

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
      Active: true,
      Hash: crypto.randomBytes(16).toString('hex'),
      Email: email,
      Contact: contact
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


/**
 * This is the API designed for the Coupon System frontend, to use Coupon by its Hash code from the provider's QR scan
 * @params amount -> the number of point consumed (addition of Membership p & Discount p)
 * @params account -> the account name of the Coupon Sys
 * @returns member_name -> member name whose points is being consumed
 * @returns member_email -> member's email to send notification
 * @returns notes -> Chinese explanation for the successful or not and for viewing in frontend
 */
app.post('/record-md-deduction', async (req, res) => {
  const { amount, discount, account, member_name, member_email, notes } = req.body;

  if (!amount || !discount) {
    return res.status(400).json({ message: 'How much consumed is NeSseSarY!' });
  }

  if (!account || !member_name || !member_email) {
    return res.status(400).json({ message: 'System account & Member detail is required!' });
  }

  try {
    // Step 1: Find the user by username
    const userResponse = await axios.get(
      `${STRAPI_API}/coupon-sys-accounts?populate=ConsumptionRecord&filters[Name][$eq]=${account}`,
      {
        headers: { Authorization: `Bearer ${STRAPI_KEY}` },
      }
    );

    const user = userResponse.data?.data[0];

    if (!user) {
      console.error("Missing User Specs, Request aborted.");
      return res.status(404).json({ message: '用户未找到，无法记录使用历史' });
    }

    const userId = user.documentId;
    const consumptionRecord = user.ConsumptionRecord || []; // Get the records (new array for first one)
    const sanitizedConsumptionRecord = consumptionRecord.map((record) => {
      const { id, ...rest } = record; // Remove id
      return rest;
    });

    // Step 2: Add a new entry to ConsumptionRecord
    const newRecord = {
      Consumer: member_name,
      Provider: account,
      Platform: 'MembershipDirect',
      Time: new Date().toISOString(), 
      Amount: amount,
      AdditionalInfo: notes,
    };

    const { id, data: otherFields } = user;

    await axios.put(
      `${STRAPI_API}/coupon-sys-accounts/${userId}`,
      {
        data: {
          ...otherFields,
          ConsumptionRecord: [...sanitizedConsumptionRecord, newRecord], // New record la
        },
      },
      {
        headers: { Authorization: `Bearer ${STRAPI_KEY}` },
      }
    );

    // Step 3: Send a notification Email
    await axios.post(
      `${EMAIL_API_ENDPOINT}/member-direct-notify`,
      {
        name: member_name,
        email: member_email,
        account: "WCO",
        point: amount,
        discount: discount,
        info: notes
      },
      { headers: {
        "Content-Type": "application/json"
      }}
    );

    logSuccess(200, `[CouponSys - MembershipDirect] Consumed ${amount} successfully for ${member_name}`);
    res.json({ message: '成功，已记录到用户历史！' });
  } catch (error) {
    console.error('Error Ocuured - ', error);
    res.status(500).json({ message: '服务器宕机辣' });
  }
});


const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
