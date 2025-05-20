#!/bin/bash

# 安装必要的依赖
echo "正在安装必要的依赖..."
pip install flask flask-cors

# 启动后端服务器
echo "启动后端服务器，监听端口 8006..."
python server.py 