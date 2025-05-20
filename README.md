# SLM Jailbreak Website

这是一个用于展示和测试小型语言模型（SLM）越狱方法的网站。用户可以选择不同的SLM模型和越狱方法，输入查询，然后查看越狱提示的优化过程和结果。

## 功能特点

- 支持多种SLM模型和越狱方法
- 实时显示越狱提示优化过程
- 终端输出可滚动查看
- 响应式设计，适应不同设备

## 系统要求

- Python 3.6+
- Flask
- Flask-CORS
- 浏览器支持EventSource（大多数现代浏览器都支持）

## 安装与运行

### Windows

1. 安装依赖：
   ```
   pip install flask flask-cors
   ```

2. 启动后端服务器：
   ```
   python server.py
   ```

3. 在浏览器中打开`index.html`查看网站

### Linux/Mac

1. 安装依赖：
   ```
   pip install flask flask-cors
   ```

2. 给启动脚本添加执行权限：
   ```
   chmod +x start_server.sh
   ```

3. 运行启动脚本：
   ```
   ./start_server.sh
   ```

4. 在浏览器中打开`index.html`查看网站

## 使用方法

1. 在网站上选择SLM家族、具体模型和越狱方法
2. 输入您想要测试的查询
3. 点击"Submit Query"按钮
4. 观察终端输出，查看越狱提示的优化过程
5. 优化完成后，查看生成的越狱提示和模型响应

## 后端API

后端服务器提供了以下API：

- `GET/POST /optimize`：接收查询参数并返回优化结果
  - 参数：
    - `question`：用户查询
    - `slm`：选择的SLM模型
    - `method`：选择的越狱方法
  - 返回：
    - 使用Server-Sent Events (SSE)实时返回优化过程和结果

## 注意事项

- 后端服务器默认运行在`http://localhost:8006`
- 确保HarmBench的main.py文件路径正确配置在server.py中
  - 默认路径为`/data2/zwh/HarmBench_for_backend/main.py`
  - 如需修改，请编辑server.py中的路径
- 该系统仅用于研究和教育目的，请勿用于任何恶意或违法活动

## 文件结构

- `index.html`：网站主页
- `server.py`：后端服务器
- `start_server.sh`：启动脚本
- `website/`：前端资源目录
  - `components/`：网站组件
  - `styles/`：CSS样式
  - `js/`：JavaScript脚本