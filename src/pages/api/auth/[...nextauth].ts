import { query as q } from 'faunadb'

import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"

import { faunaDb } from '../../../services/faunaDb';

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
	async signIn({ user, account, profile, email, credentials }) {
		const { email: userEmail } = user;
		try {
			await faunaDb.query(
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
