import { query as q } from 'faunadb'

import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

import { faunaDB } from '../../../services/fauna';

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
	  authorization: {
		  params: {
			  scope: 'read:user'
		  }
	  }
    }),
  ],
  callbacks : {
	async session({ session }) {
			try {
			const userActiveSubscription = await faunaDB.query(
				q.Get(
				q.Intersection([
					q.Match(
					q.Index('subscription_by_user_ref'),
					q.Select(
						"ref",
						q.Get(
						q.Match(
							q.Index('user_by_email'),
							q.Casefold(session.user.email)
						)
						)
					)
					),
					q.Match(
					q.Index('subscription_by_status'),
					"active"
					)
				])
				)
			)

			return {
				...session,
				activeSubscription: userActiveSubscription
			};
			} catch {
			return {
				...session,
				activeSubscription: null
			};
		}
	},
	async signIn({ user, account, profile, email, credentials }) {
		const { email: userEmail } = user;
		try {
			await faunaDB.query(
				q.If(
					q.Not(
						q.Exists(
							q.Match(
								q.Index('user_by_email'),
								q.Casefold(userEmail)
							)
						)
					),
					q.Create(
						q.Collection('users'),
						{
							data: { email: userEmail }
						}
					),
					q.Get(
						q.Index('user_by_email'),
						q.Casefold(userEmail)
					)
				)
			)

			return true
		} catch {
			return true
		}

	  },
  }
})
