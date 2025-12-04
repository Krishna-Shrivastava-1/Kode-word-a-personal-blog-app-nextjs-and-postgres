import pool from "@/lib/db.js";

// Store temporary registration data (BEFORE email verification)
export async function storeTempUser(name, email, password) {
  try {
    // Delete old temp data
    await pool.query('DELETE FROM temp_users WHERE email = $1', [email]);
    
    await pool.query(`
      INSERT INTO temp_users (name, email, password, expires_at)
      VALUES ($1, $2, $3, NOW() + INTERVAL '10 minutes')
    `, [name, email, password]);  // Password stored temporarily (plain)
    
    return { success: true };
  } catch (error) {
    console.error('Store temp user error:', error.message);
    throw error;
  }
}

// Get stored registration data
export async function getTempUser(email) {
  try {
    const result = await pool.query(`
      SELECT name, email, password
      FROM temp_users 
      WHERE email = $1 AND NOW() < expires_at
    `, [email]);
    
    return result.rows[0];
  } catch (error) {
    console.error('Get temp user error:', error.message);
    throw error;
  }
}

// Delete temp data after user created
export async function deleteTempUser(email) {
  await pool.query('DELETE FROM temp_users WHERE email = $1', [email]);
}

// Add OTP
export async function addOTP(email, otp) {
  try {
    await pool.query('DELETE FROM verify_user WHERE email = $1', [email]);
    
    await pool.query(`
      INSERT INTO verify_user (email, otp, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '5 minutes')
    `, [email, otp]);
    
    return { success: true };
  } catch (error) {
    console.error('Add OTP error:', error.message);
    throw error;
  }
}

// Verify OTP
export async function checkOTP(email, otp) {
  try {
    const result = await pool.query(`
      SELECT id FROM verify_user 
      WHERE email = $1 AND otp = $2 AND NOW() < expires_at
    `, [email, otp]);
    
    if (result.rows.length > 0) {
      // Valid OTP → delete it
      await pool.query('DELETE FROM verify_user WHERE email = $1', [email]);
      return { valid: true };
    }
    
    return { valid: false };
  } catch (error) {
    console.error('Check OTP error:', error.message);
    throw error;
  }
}
