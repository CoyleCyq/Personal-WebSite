'use strict';
const ms = require('ms');
const Controller = require('egg').Controller;

class AccountController extends Controller {
  // 登录
  async login() {
    const { ctx, app } = this;
    try {
      const prm = ctx.formatResponse.prm;
      let where = {};
      console.log('参数', prm)
      if (prm.username && prm.password) {
        let userObj = await app.model.User.findOne({
          where: {
            name: prm.username
          }
        });
        // let userObj = await ctx.service.account.findByName(prm.username) // egg-mysql
        if (userObj) {
          userObj = JSON.parse(JSON.stringify(userObj));
          const password = await app.encryptionPassword(userObj.id, prm.password);
          console.log('密码', password);
          where.password = password
          await ctx.logout();
          where.name = prm.username;
          let user = await app.model.User.findOne({
              where
          });
          // let user = await service.account.findByName(prm.username) // egg-mysql
          if (user) {
            user = JSON.parse(JSON.stringify(user));
            user.token = user.roles;
            await ctx.login(JSON.parse(JSON.stringify(user)));
            // await app.redis.setex("user:" + user.id, 60 * 60 * 24, ctx.session._sessCtx.externalKey);
            ctx.session.maxAge = ms('2h');
            delete user.password;
            ctx.formatResponse.body = user;
            const body = ctx.formatResponse.formattedRes();
            ctx.body = body;
          } else {
            throw new Error("用户名或密码错误");
          }
        } else {
          throw new Error("用户名或密码错误");
        }
      } else {
        throw new Error("缺少参数");
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  // 登出
  async logout() {
    const { ctx } = this;
    try {
      ctx.logout();
      ctx.formatResponse.body = "ok";
      const body = ctx.formatResponse.formattedRes();
      ctx.body = body;
    } catch (error) {
      throw error;
    }
  }
  // 获取用户信息
  async getUserInfo () {
    const { ctx, app } = this;
    try {
      const prm = ctx.formatResponse.prm;
      let where = {
          roles: prm.token
      };
      let userInfo = await app.model.User.findOne({
          where
      })
      // let userInfo = await service.account.findBytoken(prm.token) // egg-mysql
      let roles = []
      roles.push(userInfo.roles)
      userInfo.roles = roles;
      ctx.formatResponse.body = userInfo;
      const body = ctx.formatResponse.formattedRes();
      ctx.body = body;
    } catch (error) {
      throw error;
    }
  }
}
  
module.exports = AccountController;