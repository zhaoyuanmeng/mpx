const loaderUtils = require('loader-utils')
const normalize = require('./utils/normalize')
const selectorPath = normalize.lib('selector')
const addQuery = require('./utils/add-query')
const parseRequest = require('./utils/parse-request')

const defaultLang = {
  template: 'wxml',
  styles: 'wxss',
  script: 'js',
  json: 'json',
  wxs: 'wxs'
}

module.exports = function createHelpers (loaderContext) {
  const rawRequest = loaderUtils.getRemainingRequest(loaderContext)
  const { resourcePath, queryObj } = parseRequest(loaderContext.resource)

  const { mode, env } = loaderContext.getMpx() || {}

  function getRequire (type, part, extraOptions, index) {
    return 'require(' + getRequestString(type, part, extraOptions, index) + ')'
  }

  function getImport (type, part, extraOptions, index) {
    return (
      'import __' + type + '__ from ' +
      getRequestString(type, part, extraOptions, index)
    )
  }

  function getNamedExports (type, part, extraOptions, index) {
    return (
      'export * from ' +
      getRequestString(type, part, extraOptions, index)
    )
  }

  function getFakeRequest (type, part) {
    const lang = part.lang || defaultLang[type] || type
    const options = { ...queryObj }
    if (lang === 'json') options.asScript = true
    return addQuery(`${resourcePath}.${lang}`, options)
  }

  function getRequestString (type, part, extraOptions = {}, index = 0) {
    const src = part.src
    const options = {
      mpx: true,
      type,
      index,
      ...extraOptions
    }

    switch (type) {
      case 'json':
        options.asScript = true
        if (part.useJSONJS) options.useJSONJS = true
      // eslint-disable-next-line no-fallthrough
      case 'styles':
      case 'template':
        options.extract = true
    }

    if (part.mode) options.mode = part.mode

    if (src) {
      return loaderUtils.stringifyRequest(loaderContext, addQuery(src, options, true))
    } else {
      const fakeRequest = getFakeRequest(type, part)
      const request = `${selectorPath}?mode=${mode}&env=${env}!${addQuery(rawRequest, options, true)}`
      return loaderUtils.stringifyRequest(loaderContext, `${fakeRequest}!=!${request}`)
    }
  }

  return {
    getRequire,
    getImport,
    getNamedExports,
    getRequestString
  }
}
