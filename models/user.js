/** User class for message.ly */

/** User of the site. */

class User {
	/** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

	static async register({ username, password, first_name, last_name, phone }) {
		const result = await db.query(
			`INSERT INTO users (
        username, password, first_name, last_name, phone
      ) VALUES ($1, $2, $3, $4, $5)
        RETURNING username, password, first_name, last_name, phone`,
			[ username, password, first_name, last_name, phone ]
		);
		return result.rows[0];
	}

	/** Authenticate: is this username/password valid? Returns boolean. */

	static async authenticate(username, password) {
		const result = await db.query(
			`SELECT username
      FROM users
      WHERE username = $1 AND password = $2`,
			[ username, password ]
		);
		let u = result.rows[0];
		return !!u;
		// return Boolean(u);
	}

	/** Update last_login_at for user */

	static async updateLoginTimestamp(username) {
		result = await db.query(
			`UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1`,
			[ username ]
		);
	}

	/** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

	static async all() {
		result = await db.query(`
    SELECT username, first_name, last_name, phone
    FROM users`);
		return result.rows;
	}

	/** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

	static async get(username) {
		results = await db.query(
		`SELECT username, first_name, last_name, phone, join_at, last_login_at
    FROM users
    WHERE username = $1`,
			[ username ]
		);
		return results.rows[0];
	}

	/** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

	static async messagesFrom(username) {}

	/** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

	static async messagesTo(username) {}
}

module.exports = User;
