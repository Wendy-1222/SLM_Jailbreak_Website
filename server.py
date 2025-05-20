from flask import Flask, request, jsonify, Response
import subprocess
import os
import time
import threading
from flask_cors import CORS
import json
import re

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # 允许所有来源的跨域请求

@app.route('/optimize', methods=['GET', 'POST'])
def optimize():
    # 获取前端传来的参数
    if request.method == 'POST':
        data = request.json
        question = data.get('question')
        slm = data.get('slm')
        method = data.get('method')
    else:  # GET 请求
        question = request.args.get('question')
        slm = request.args.get('slm')
        method = request.args.get('method')
    
    # 创建一个响应对象，用于流式传输输出
    def generate():
        # 发送初始消息
        yield f'data: {{"status": "started", "message": "开始优化越狱提示..."}}\n\n'
        
        # 构建调用脚本的命令
        cmd = [
            'python', 'd:/code/HarmBench_for_backend/generate_jailbreak_prompt.py',
            '--question', question,
            '--slm', slm,
            '--method', method
        ]
        
        # 运行脚本并实时获取输出
        process = subprocess.Popen(
            cmd, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1  # 行缓冲
        )
        
        # 存储所有输出行，用于提取最终的jailbreak prompt
        output_lines = []
        final_prompt = None
        
        # 实时读取并发送输出
        for line in iter(process.stdout.readline, ''):
            line = line.strip()
            if line:  # 只处理非空行
                output_lines.append(line)
                
                # 检查是否是最终的jailbreak prompt行
                if line.startswith("Final optimized prompt:"):
                    # 提取最终的prompt（去掉前缀）
                    final_prompt = line[len("Final optimized prompt:"):].strip()
                
                # 确保正确格式化JSON并转义特殊字符
                message_json = json.dumps({"status": "running", "message": line})
                yield f'data: {message_json}\n\n'
                # 添加短暂延迟确保客户端能处理消息
                time.sleep(0.05)
        
        # 等待进程完成
        process.wait()
        
        # 如果没有找到明确标记的最终prompt，则使用最后一行
        if final_prompt is None:
            final_prompt = output_lines[-1] if output_lines else "优化失败，未获取到结果"
        
        # 发送完成消息
        message_json = json.dumps({"status": "completed", "final_prompt": final_prompt})
        yield f'data: {message_json}\n\n'
    
    return Response(generate(), mimetype='text/event-stream')

@app.route('/response', methods=['GET', 'POST'])
def generate_response():
    # 获取前端传来的参数
    if request.method == 'POST':
        data = request.json
        prompt = data.get('prompt')
        slm = data.get('slm')
    else:  # GET 请求
        prompt = request.args.get('prompt')
        slm = request.args.get('slm')
    
    # 创建一个响应对象，用于流式传输输出
    def generate():
        # 发送初始消息
        yield f'data: {{"status": "started", "message": "开始生成越狱回复..."}}\n\n'
        
        # 构建调用脚本的命令
        cmd = [
            'python', 'd:/code/HarmBench_for_backend/generate_jailbreak_response.py',
            '--prompt', prompt,
            '--slm', slm
        ]
        
        # 运行脚本并实时获取输出
        process = subprocess.Popen(
            cmd, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1  # 行缓冲
        )
        
        # 存储所有输出行，用于提取最终的jailbreak response
        output_lines = []
        final_response = None
        
        # 实时读取并发送输出
        for line in iter(process.stdout.readline, ''):
            line = line.strip()
            if line:  # 只处理非空行
                output_lines.append(line)
                
                # 检查是否是最终的jailbreak response行
                if line.startswith("Jailbreak response:"):
                    # 提取最终的response（去掉前缀）
                    final_response = line[len("Jailbreak response:"):].strip()
                
                # 确保正确格式化JSON并转义特殊字符
                message_json = json.dumps({"status": "running", "message": line})
                yield f'data: {message_json}\n\n'
                # 添加短暂延迟确保客户端能处理消息
                time.sleep(0.05)
        
        # 等待进程完成
        process.wait()
        
        # 如果没有找到明确标记的最终response，则使用最后一行
        if final_response is None:
            final_response = output_lines[-1] if output_lines else "生成失败，未获取到结果"
        
        # 发送完成消息
        message_json = json.dumps({"status": "completed", "final_response": final_response})
        yield f'data: {message_json}\n\n'
    
    return Response(generate(), mimetype='text/event-stream')

@app.route('/evaluate', methods=['GET', 'POST'])
def evaluate_response():
    # 获取前端传来的参数
    if request.method == 'POST':
        data = request.json
        question = data.get('question')
        slm = data.get('slm')
        prompt = data.get('prompt')
        response = data.get('response')
    else:  # GET 请求
        question = request.args.get('question')
        slm = request.args.get('slm')
        prompt = request.args.get('prompt')
        response = request.args.get('response')
    
    # 创建一个响应对象，用于流式传输输出
    def generate():
        # 发送初始消息
        yield f'data: {{"status": "started", "message": "开始评估越狱响应..."}}\n\n'
        
        # 构建调用脚本的命令
        cmd = [
            'python', 'd:/code/HarmBench_for_backend/evaluate_jailbreal_response.py',
            '--question', question,
            '--slm', slm,
            '--prompt', prompt,
            '--response', response
        ]
        
        # 运行脚本并实时获取输出
        process = subprocess.Popen(
            cmd, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1  # 行缓冲
        )
        
        # 存储所有输出行，用于提取评估结果
        output_lines = []
        evaluation_result = None
        
        # 实时读取并发送输出
        for line in iter(process.stdout.readline, ''):
            line = line.strip()
            if line:  # 只处理非空行
                output_lines.append(line)
                
                # 检查是否是最终的评估结果行
                if line.startswith("Evaluation result:"):
                    # 提取最终的评估结果（去掉前缀）
                    evaluation_result = line[len("Evaluation result:"):].strip()
                
                # 确保正确格式化JSON并转义特殊字符
                message_json = json.dumps({"status": "running", "message": line})
                yield f'data: {message_json}\n\n'
                # 添加短暂延迟确保客户端能处理消息
                time.sleep(0.05)
        
        # 等待进程完成
        process.wait()
        
        # 如果没有找到明确标记的评估结果，则使用默认值
        if evaluation_result is None:
            evaluation_result = "0"  # 默认为失败
        
        # 尝试将评估结果转换为整数
        try:
            evaluation_label = int(evaluation_result.strip())
        except (ValueError, TypeError):
            evaluation_label = 0  # 如果转换失败，默认为失败
        
        # 发送完成消息
        message_json = json.dumps({"status": "completed", "evaluation_label": evaluation_label})
        yield f'data: {message_json}\n\n'
    
    return Response(generate(), mimetype='text/event-stream')

if __name__ == '__main__':
    # 在生产环境中，应该使用更可靠的WSGI服务器
    print("启动服务器，监听端口 8006...")
    app.run(host='0.0.0.0', port=8006, threaded=True) 