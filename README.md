优化：
    1.nprogress添加进度条（基于拦截器配置进度条）
    2.通过vue.config.js修改webpack的默认配置
       配置打包入口（chainwebpack）
    3.通过webpack的externals节点加载外部CDN资源。凡是声明在externals中的第三方依赖包，都不会被打包。在public/index文件头部添加cdn资源引用
    4. 路由懒加载，分组打包到js文件中
上线：
     1. web服务器托管静态目录
     2.开启gzip减小文件体积，使传输速度跟快
     3. 配置https服务
     4.pm2管理服务器，帮忙后台运行网站
     
前端模块化：
     1. 
