import * as Backbone from 'backbone'

export interface User {
  userID: string
  userName: string
  password: string
}

export class UserModel extends Backbone.Model implements User {
  constructor(attrs?: User, options?: any) {
    super(attrs || {}, options)
  }
  get userID() : string {
    return this.get('userID')
  }

  set userID(v: string) {
    this.set('userID', v)
  }

  get userName(): string {
    return this.get('userName')
  }

  set userName(v: string) {
    this.set('userName', v)
  }

  get password(): string {
    return this.get('password')
  }
  set password(v: string) {
    this.set('password', v)
  }
}

export class UserCollection extends Backbone.Collection<UserModel> {
  url = "/api/users"

  model = UserModel
}

export class ClientModel extends Backbone.Model {
  url = () => "/api/adminclient"

  get clientKey(): string {
    return this.get('clientKey')
  }
  set clientKey(v: string) {
    this.set('clientKey', v)
  }
  get clientName(): string {
    return this.get('clientName')
  }
  set clientName(v: string) {
    this.set('clientName', v)
  }
}

export interface Api {
  apiPath: string
  apiName: string
  conditionJson: string
  responseJson: string
}

export class ApiModel extends Backbone.Model implements Api {
  constructor(attr?: any, options?:any) {
    super(attr || {}, options)
  }

  get apiPath(): string {
    return this.get('apiPath')
  }

  set apiPath(v: string) {
    this.set('apiPath', v)
  }

  get apiName(): string {
    return this.get('apiName')
  }

  set apiName(v: string) {
    this.set('apiName', v)
  }

  get conditionJson(): string {
    return this.get('conditionJson')
  }

  set conditionJson(v: string) {
    this.set('conditionJson', v)
  }

  get responseJson(): string {
    return this.get('responseJson')
  }

  set responseJson(v: string) {
    this.set('responseJson', v)
  }
}

export class ApiCollection extends Backbone.Collection<ApiModel> {
  constructor(readonly idOfUser: string) {
    super()
  }

  url = () => `/api/users/${this.idOfUser}/apis`
  model = ApiModel
}

export interface History {
  accessTime: number
  requestJson: string
  responseJson: string
}

export class HistoryModel extends Backbone.Model implements History {
  constructor(attrs?: any, options?:any) {
    super(attrs, options)
  }

  get accessTime(): number {
    return this.get('accessTime')
  }

  set accessTime(v: number) {
    this.set('accessTime', v)
  }

  get requestJson(): string {
    return this.get('requestJson')
  }

  set requestJson(v: string) {
    this.set('requestJson', v)
  }

  get responseJson(): string {
    return this.get('responseJson')
  }

  set responseJson(v: string) {
    this.set('responseJson', v)
  }
}

export class HistoryCollection extends Backbone.Collection<HistoryModel> {
  constructor(readonly apiId: string) {
    super()
  }

  url = () => `/api/hist/api/${this.apiId}`
  model = HistoryModel
}

export interface Config {
  name: string
  value: string
}

export class ConfigModel extends Backbone.Model implements Config {
  constructor(attrs?: any, options?:any) {
    super(attrs, options)
  }

  get name():string {
    return this.get("name")
  }

  set name(v: string) {
    this.set("name", v)
  }

  get value():string {
    return this.get("value")
  }

  set value(v: string) {
    this.set("value", v)
  }
}

export class ConfigCollection extends Backbone.Collection<ConfigModel> {

  url = () => `/api/configurations`
  model = ConfigModel
}

