/**
 * main.js - 包含所有网站的JavaScript功能
 * 该文件整合了原index.html中的所有内联脚本
 */

// 定义全局变量，跟踪当前激活的内容区域和卡片
var activeContent = null;
var activeCard = null;
// 添加初始化标志
var defenseExamplesInitialized = false;

// 定义SLM模型数据变量，将从JSON文件加载
var slmModelsData = {};

// 从JSON文件加载SLM模型数据
function loadSLMModelsData() {
    console.log('开始加载SLM模型数据...');
    fetch('./website/examples/model_series_order.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load model_series_order.json: ${response.status} ${response.statusText}`);
            }
            console.log('成功获取model_series_order.json响应');
            return response.json();
        })
        .then(data => {
            // 将加载的数据存储在全局变量中
            slmModelsData = data;
            console.log('成功解析model_series_order.json数据');
            console.log('可用的SLM家族:', Object.keys(slmModelsData));
            
            // 加载完成后，初始化try.html页面的下拉菜单
            setupSLMFamilyDropdown();
        })
        .catch(error => {
            console.error('Error loading model_series_order.json:', error);
            console.log('使用备用数据');
            
            // 使用备用数据
            slmModelsData = {
                "Llama3.2": ["LLaMA 3.2 1B", "LLaMA 3.2 3B"],
                "DeepSeek-R1": ["DeepSeek-R1-Distill-Qwen-1.5B", "DeepSeek-R1-Distill-Qwen-7B"],
                "Qwen": ["Qwen 1.8B Chat", "Qwen 7B Chat", "Qwen 1.5 0.5B Chat"],
                "Gemma": ["Gemma 2B", "Gemma 7B"],
                "Phi": ["Phi-3 Mini 4K Instruct", "Phi-3 Mini 128K Instruct"],
                "MiniCPM": ["MiniCPM 1B", "MiniCPM 2B"],
                "H2O-Danube": ["H2O-Danube 1.8B"],
                "SmolLM": ["SmolLM 1.7B"],
                "StableLM": ["StableLM 3B"],
                "TinyLlama": ["TinyLlama 1.1B"],
                "MobileLlama": ["MobileLLaMA 1.4B"],
                "MobiLlama": ["MobiLlama 1B"],
                "Fox": ["Fox 1B"],
                "Dolly": ["Dolly 3B"],
                "OLMo": ["OLMo 7B"]
            };
            
            // 即使使用备用数据，也尝试初始化下拉菜单
            setupSLMFamilyDropdown();
        });
}

// 当文档加载完成后运行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded 事件触发');
    // 监听结果容器的变化
    observeResultsContainer();
    
    // 设置滚动导航栏
    setupScrollNavbar();

    // 加载SLM模型数据
    loadSLMModelsData();
    
    // 尝试直接调用defense下拉菜单初始化
    try {
        setupDefenseDropdown();
        console.log('Defense下拉菜单初始化完成');
    } catch (e) {
        console.warn('Defense下拉菜单初始化失败：', e);
    }
    
    // 监听try容器的变化，以便在加载完成后设置终端按钮
    observeTryContainer();
    
    // 添加延迟检查，确保所有组件加载后再尝试初始化RQ3相关功能
    setTimeout(() => {
        const defense_select = document.getElementById('defense-select');
        const defense_method_select = document.getElementById('defense-method-select');
        const try_slm_family_select = document.getElementById('try-slm-family-select');
        
        if (defense_select) {
            console.log('找到defense-select，重新初始化');
            setupDefenseDropdown();
        }
        
        if (defense_method_select) {
            console.log('找到defense-method-select，初始化防御示例相关功能');
            // 不要在这里调用 setupDefenseExamples，让它只在 initializeResults 中调用一次
        }

        // 再次检查try.html的下拉菜单，确保它们被正确初始化
        if (try_slm_family_select && Object.keys(slmModelsData).length > 0) {
            console.log('找到try-slm-family-select，重新初始化');
            setupSLMFamilyDropdown();
        }
        
        // 再次尝试设置终端按钮
        setupClearTerminalButton();
    }, 1000); // 延迟1秒

    // 添加点击事件，当点击页面空白处时关闭下拉内容
    document.addEventListener('click', function(event) {
        closeDropdownsOnOutsideClick(event);
    });
});

// 使用 MutationObserver 监听 try-container 的变化
function observeTryContainer() {
    const tryContainer = document.getElementById('try-container');
    if (!tryContainer) {
        console.log('try-container 未找到，无法监听变化');
        return;
    }
    
    console.log('开始监听 try-container 的变化');
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                console.log('try-container 内容已变化，设置终端按钮');
                // 当 try-container 内容变化时设置终端按钮
                setupClearTerminalButton();
            }
        });
    });
    
    // 开始观察 try-container 的子节点变化
    observer.observe(tryContainer, { childList: true });
}

// 设置SLM家族下拉菜单，当选择家族时填充相应的SLM模型
function setupSLMFamilyDropdown() {
    const slmFamilySelect = document.getElementById('try-slm-family-select');
    const slmSelect = document.getElementById('try-slm-select');
    const jailbreakSelect = document.getElementById('try-jailbreak-select');
    const submitButton = document.getElementById('submit-query');
    
    // 添加详细的调试日志
    console.log('setupSLMFamilyDropdown 开始执行');
    console.log('找到try-slm-family-select元素:', !!slmFamilySelect);
    console.log('找到try-slm-select元素:', !!slmSelect);
    console.log('找到try-jailbreak-select元素:', !!jailbreakSelect);
    console.log('找到submit-query元素:', !!submitButton);
    
    if (!slmFamilySelect || !slmSelect) {
        console.warn('SLM家族下拉菜单或SLM模型下拉菜单未找到');
        return;
    }
    
    // 检查是否已加载模型数据
    if (Object.keys(slmModelsData).length === 0) {
        console.warn('SLM模型数据尚未加载，无法初始化下拉菜单');
        return;
    }
    
    console.log('初始化SLM家族下拉菜单');
    console.log('可用的SLM家族数据:', Object.keys(slmModelsData));
    
    // 初始化时禁用SLM模型下拉菜单，直到用户选择了SLM家族
    slmSelect.disabled = true;
    
    // 当选择SLM家族时，填充对应的SLM模型选项
    slmFamilySelect.addEventListener('change', function() {
        const selectedFamily = this.value;
        console.log('选择的SLM家族：', selectedFamily);
        
        // 清空当前的SLM模型选项
        slmSelect.innerHTML = '<option value="">Select an SLM model...</option>';
        
        // 如果选择了有效的家族，添加对应的模型选项
        if (selectedFamily && slmModelsData[selectedFamily]) {
            const models = slmModelsData[selectedFamily];
            console.log(`为家族 "${selectedFamily}" 添加模型:`, models);
            
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                
                // 显示更友好的模型名称（去除下划线，保持原始大小写）
                let displayName = model;
                
                // 尝试美化模型名称显示
                try {
                    // 替换下划线为空格
                    displayName = model.replace(/_/g, ' ');
                    
                    // 首字母大写处理（保持原有大小写的单词）
                    if (displayName === displayName.toLowerCase()) {
                        displayName = displayName.split(' ').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ');
                    }
                } catch (e) {
                    console.warn('模型名称格式化失败:', e);
                }
                
                option.textContent = displayName;
                slmSelect.appendChild(option);
            });
            
            // 启用SLM模型下拉菜单
            slmSelect.disabled = false;
            console.log('SLM模型下拉菜单已启用');
        } else {
            // 如果没有选择有效的家族，禁用SLM模型下拉菜单
            slmSelect.disabled = true;
            console.log('SLM模型下拉菜单已禁用');
        }
        
        // 更新提交按钮状态
        updateSubmitButtonState();
    });
    
    // 为其他下拉菜单添加事件监听器，以更新提交按钮状态
    slmSelect.addEventListener('change', function() {
        console.log('选择的SLM模型:', this.value);
        updateSubmitButtonState();
    });
    
    jailbreakSelect.addEventListener('change', function() {
        console.log('选择的Jailbreak方法:', this.value);
        updateSubmitButtonState();
    });
    
    // 为查询输入框添加事件监听器
    const jailbreakQuery = document.getElementById('jailbreak-query');
    if (jailbreakQuery) {
        jailbreakQuery.addEventListener('input', function() {
            console.log('Jailbreak查询已更新，长度:', this.value.trim().length);
            updateSubmitButtonState();
        });
    } else {
        console.warn('未找到jailbreak-query元素');
    }
    
    // 为提交按钮添加点击事件监听器
    if (submitButton) {
        submitButton.addEventListener('click', function() {
            handleJailbreakSubmit();
        });
    }
    
    // 初始化时更新提交按钮状态
    updateSubmitButtonState();
    
    // 记录初始化完成
    console.log('SLM家族下拉菜单初始化完成');
}

// 处理Jailbreak查询提交
function handleJailbreakSubmit() {
    console.log('处理Jailbreak查询提交...');
    
    // 获取所有必要的元素
    const slmFamilySelect = document.getElementById('try-slm-family-select');
    const slmSelect = document.getElementById('try-slm-select');
    const jailbreakSelect = document.getElementById('try-jailbreak-select');
    const jailbreakQuery = document.getElementById('jailbreak-query');
    const displayContainer = document.getElementById('jailbreak-try-display');
    
    if (!slmFamilySelect || !slmSelect || !jailbreakSelect || !jailbreakQuery || !displayContainer) {
        console.error('提交处理失败：缺少必要的元素');
        return;
    }
    
    // 获取用户选择和输入的值
    const selectedFamily = slmFamilySelect.value;
    const selectedModel = slmSelect.value;
    const selectedJailbreak = jailbreakSelect.value;
    const query = jailbreakQuery.value.trim();
    
    console.log('提交的值:', {
        family: selectedFamily,
        model: selectedModel,
        jailbreak: selectedJailbreak,
        query: query
    });
    
    // 清空显示容器
    displayContainer.innerHTML = '';
    
    // 在测试阶段，使用固定的值
    const testPrompt = `这是一个使用 ${selectedJailbreak} 方法生成的测试Jailbreak提示。\n\n原始查询: "${query}"\n\n[这里是根据不同jailbreak方法生成的提示内容...]`;
    const testResponse = `这是一个来自 ${selectedModel} 模型的测试回复。\n\n我很抱歉，但我不能提供有关如何进行有害活动的指导或支持。我被设计为一个负责任的AI助手，旨在提供有用、安全和道德的信息。\n\n如果您有其他问题或需要帮助，请随时告诉我，我很乐意以建设性和有益的方式提供帮助。`;
    
    // 随机生成测试标签（0表示拒绝，1表示成功）
    const testLabel = Math.random() > 0.5 ? 1 : 0;
    
    // 显示查询、提示和响应
    displayQuestionWithTypewriter(displayContainer, query);
    
    // 创建并显示消息
    setTimeout(() => {
        displayPromptMessage(displayContainer, testPrompt, "prompt-message", "Jailbreak Prompt");
        
        setTimeout(() => {
            // 使用模型名称作为响应标题
            let modelDisplayName = selectedModel;
            try {
                modelDisplayName = selectedModel.replace(/_/g, ' ');
                if (modelDisplayName === modelDisplayName.toLowerCase()) {
                    modelDisplayName = modelDisplayName.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ');
                }
            } catch (e) {
                console.warn('模型名称格式化失败:', e);
            }
            
            displayResponseWithTypewriter(displayContainer, testResponse, "response-message", `${modelDisplayName} Response`, testLabel);
            
            // 添加终端输出
            const terminalOutput = document.getElementById('terminal-output');
            if (terminalOutput) {
                const timestamp = new Date().toLocaleTimeString();
                terminalOutput.innerHTML += `<div class="terminal-line">[${timestamp}] 查询已提交: "${query.substring(0, 30)}${query.length > 30 ? '...' : ''}"</div>`;
                terminalOutput.innerHTML += `<div class="terminal-line">[${timestamp}] 使用模型: ${modelDisplayName}</div>`;
                terminalOutput.innerHTML += `<div class="terminal-line">[${timestamp}] 使用方法: ${selectedJailbreak}</div>`;
                terminalOutput.innerHTML += `<div class="terminal-line">[${timestamp}] 评估结果: ${testLabel === 0 ? 'Jailbreak Fail' : 'Jailbreak Success!'}</div>`;
                terminalOutput.innerHTML += `<div class="terminal-line">--------------------------------------------------</div>`;
                
                // 滚动到底部
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            }
        }, 1000);
    }, 3000); // 问题打字机完成后的延迟
}

// 更新提交按钮的启用/禁用状态
function updateSubmitButtonState() {
    console.log('执行updateSubmitButtonState...');
    
    const slmFamilySelect = document.getElementById('try-slm-family-select');
    const slmSelect = document.getElementById('try-slm-select');
    const jailbreakSelect = document.getElementById('try-jailbreak-select');
    const jailbreakQuery = document.getElementById('jailbreak-query');
    const submitButton = document.getElementById('submit-query');
    
    console.log('表单元素状态:', {
        'slmFamilySelect': slmFamilySelect ? `找到，值=${slmFamilySelect.value}` : '未找到',
        'slmSelect': slmSelect ? `找到，值=${slmSelect.value}` : '未找到',
        'jailbreakSelect': jailbreakSelect ? `找到，值=${jailbreakSelect.value}` : '未找到',
        'jailbreakQuery': jailbreakQuery ? `找到，值长度=${jailbreakQuery.value.trim().length}` : '未找到',
        'submitButton': submitButton ? '找到' : '未找到'
    });
    
    if (!slmFamilySelect || !slmSelect || !jailbreakSelect || !jailbreakQuery || !submitButton) {
        console.warn('更新提交按钮状态失败：缺少必要的表单元素');
        return;
    }
    
    // 检查所有必填字段是否已填写
    const isFormValid = 
        slmFamilySelect.value !== "" && 
        slmSelect.value !== "" && 
        jailbreakSelect.value !== "" && 
        jailbreakQuery.value.trim() !== "";
    
    console.log('表单是否有效:', isFormValid);
    
    submitButton.disabled = !isFormValid;
    
    // 如果表单有效，则启用提交按钮；否则禁用
    if (isFormValid) {
        submitButton.classList.add('active');
        console.log('提交按钮已启用');
    } else {
        submitButton.classList.remove('active');
        console.log('提交按钮已禁用');
    }
}

// 使用 MutationObserver 监听 results-container 的变化
function observeResultsContainer() {
    const resultsContainer = document.getElementById('results-container');
    if (!resultsContainer) return;
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // 当 results-container 内容变化时初始化结果组件
                initializeResults();
                
                // 停止观察（我们只需要初始化一次）
                observer.disconnect();
            }
        });
    });
    
    // 开始观察 results-container 的子节点变化
    observer.observe(resultsContainer, { childList: true });
}

// 初始化结果组件的所有交互功能
function initializeResults() {
    console.log('初始化结果组件...');
    
    // 为 RQ 卡片添加点击事件
    const rq1Card = document.getElementById('rq1-card');
    const rq2Card = document.getElementById('rq2-card');
    const rq3Card = document.getElementById('rq3-card');
    
    if (rq1Card) {
        rq1Card.addEventListener('click', function() {
            showContent('rq1');
        });
    }
    
    if (rq2Card) {
        rq2Card.addEventListener('click', function() {
            showContent('rq2');
        });
    }
    
    if (rq3Card) {
        rq3Card.addEventListener('click', function() {
            showContent('rq3');
        });
    }
    
    // 加载示例数据
    loadJailbreakExamples();
    loadDefenseExamples();
    
    // 设置下拉菜单
    setupDropdown('slm-select');
    setupDropdown('jailbreak-select');
    setupDefenseDropdown(); // 使用专门为defense设计的函数
    
    // 设置示例展示
    setupJailbreakExamples();
    setupDefenseExamples();
}

// 显示指定类型的内容区域
function showContent(contentType) {
    // 隐藏所有内容区域
    const allContentAreas = document.querySelectorAll('.content-area');
    allContentAreas.forEach(area => {
        area.classList.remove('active');
    });
    
    // 显示选中的内容区域
    const targetContent = document.getElementById(`${contentType}-content`);
    if (targetContent) {
        targetContent.classList.add('active');
        
        // 如果是RQ3，初始化防御方法下拉菜单
        if (contentType === 'rq3') {
            // 重新设置defense-select事件监听
            setupDefenseDropdown();
        }
    }
    
    // 更新卡片活跃状态
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        card.classList.remove('active');
    });
    
    const activeCard = document.getElementById(`${contentType}-card`);
    if (activeCard) {
        activeCard.classList.add('active');
    }
}

// 设置下拉菜单
function setupDropdown(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.addEventListener('change', function() {
        // 获取当前选择的值
        const selectedValue = this.value;
        if (!selectedValue) return;
        
        // 清除同级别的所有内容显示
        const allContents = select.closest('.dropdown-container').querySelectorAll('.content-display');
        allContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // 显示选中的内容
        let contentId;
        
        // 根据dropdown ID处理不同情况
        if (selectId === 'slm-select') {
            contentId = `${selectedValue.toLowerCase().replace(/\s+/g, '')}-content`;
        } else if (selectId === 'jailbreak-select') {
            contentId = `${selectedValue.toLowerCase().replace(/\s+/g, '')}-content`;
        } else if (selectId === 'defense-select') {
            // 特殊处理防御方法下拉菜单
            switch(selectedValue) {
                case 'PPL':
                    contentId = 'ppl-content';
                    break;
                case 'Llama Guard 3-1B':
                    contentId = 'llamaguard-content';
                    break;
                case 'Retokenization':
                    contentId = 'retokenization-content';
                    break;
                case 'Self-Reminder':
                    contentId = 'selfreminder-content';
                    break;
                default:
                    contentId = selectedValue.toLowerCase().replace(/\s+/g, '-') + '-content';
            }
        } else {
            contentId = `${selectedValue.toLowerCase().replace(/\s+/g, '')}-content`;
        }
        
        console.log('尝试显示内容：', contentId);
        const targetContent = document.getElementById(contentId);
        if (targetContent) {
            targetContent.classList.add('active');
        } else {
            console.warn(`未找到内容元素: ${contentId}`);
        }
    });
}

// 专门设置defense下拉菜单
function setupDefenseDropdown() {
    const defenseSelect = document.getElementById('defense-select');
    if (!defenseSelect) return;
    
    defenseSelect.addEventListener('change', function() {
        const selectedValue = this.value;
        if (!selectedValue) return;
        
        // 清除所有内容显示
        const allContents = document.querySelectorAll('#defense-content .content-display');
        allContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // 映射defense选项值到对应的content ID
        let contentId;
        switch(selectedValue) {
            case 'PPL':
                contentId = 'ppl-content';
                break;
            case 'Llama Guard 3-1B':
                contentId = 'llamaguard-content';
                break;
            case 'Retokenization':
                contentId = 'retokenization-content';
                break;
            case 'Self-Reminder':
                contentId = 'selfreminder-content';
                break;
            default:
                contentId = selectedValue.toLowerCase().replace(/\s+/g, '-') + '-content';
        }
        
        console.log('尝试显示defense内容：', contentId);
        const targetContent = document.getElementById(contentId);
        if (targetContent) {
            targetContent.classList.add('active');
        } else {
            console.warn(`未找到defense内容元素: ${contentId}`);
        }
    });
}

// 设置滚动导航栏
function setupScrollNavbar() {
    var heroHeight = document.querySelector('.hero-background') ? 
                    document.querySelector('.hero-background').offsetHeight : 0;
    var navbar = document.querySelector('.navbar-fixed-top');
    
    if (navbar && heroHeight) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > heroHeight - 70) {
                navbar.style.display = 'block';
            } else {
                navbar.style.display = 'none';
            }
        });
    }
}

// LaTeX 加载函数
function loadLatexTable() {
    fetch('table.tex')
        .then(response => response.text())
        .then(data => {
            const latexContainer = document.getElementById('latex-table');
            if (latexContainer) {
                latexContainer.innerHTML = `$$ ${data} $$`;
                // 重新渲染 MathJax
                if (window.MathJax && window.MathJax.Hub) {
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                }
            }
        })
        .catch(error => {
            console.error('加载 LaTeX 文件失败:', error);
        });
}

// 变量用于存储jailbreak示例数据
let jailbreakExamples = {};
// 变量用于存储defense示例数据
let defenseExamples = {};

// 从JSON文件加载jailbreak示例
function loadJailbreakExamples() {
    fetch('./website/examples/jailbreak_examples.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load jailbreak_examples.json');
            }
            return response.json();
        })
        .then(data => {
            // 将加载的数据存储在全局变量中
            jailbreakExamples = data;
            console.log('Successfully loaded examples from jailbreak_examples.json');
        })
        .catch(error => {
            console.error('Error loading jailbreak_examples.json:', error);
            // 如果JSON加载失败，则使用嵌入式数据
            console.log('Using fallback embedded data');
        });
}

// 从JSON文件加载defense示例
function loadDefenseExamples() {
    console.log('开始加载defense_examples.json...');
    fetch('./website/examples/defense_examples.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load defense_examples.json: ${response.status} ${response.statusText}`);
            }
            console.log('成功获取defense_examples.json响应');
            return response.json();
        })
        .then(data => {
            // 将加载的数据存储在全局变量中
            defenseExamples = data;
            console.log('成功解析defense_examples.json数据');
            console.log('Defense examples数据结构的顶层键:', Object.keys(defenseExamples));
            // 检查示例数据中的第一个SLM并记录其结构
            const firstSlm = Object.keys(defenseExamples)[0];
            if (firstSlm) {
                console.log(`示例SLM "${firstSlm}"的jailbreak方法:`, Object.keys(defenseExamples[firstSlm]));
                const firstJailbreak = Object.keys(defenseExamples[firstSlm])[0];
                if (firstJailbreak && defenseExamples[firstSlm][firstJailbreak]) {
                    console.log(`示例jailbreak "${firstJailbreak}"的defense方法:`, Object.keys(defenseExamples[firstSlm][firstJailbreak]));
                }
            }
        })
        .catch(error => {
            console.error('Error loading defense_examples.json:', error);
            console.log('Using fallback embedded data');
        });
}

// 设置jailbreak示例
function setupJailbreakExamples() {
    const slmSelect = document.getElementById('slm-attack-select');
    const jailbreakSelect = document.getElementById('jailbreak-attack-select');
    const categorySelect = document.getElementById('category-select');
    const displayContainer = document.getElementById('jailbreak-example-display');
    
    if (!slmSelect || !jailbreakSelect || !categorySelect || !displayContainer) return;
    
    // 检查是否所有下拉菜单都已选择
    function checkAllSelected() {
        const slm = slmSelect.value;
        const jailbreak = jailbreakSelect.value;
        const category = categorySelect.value;
        console.log('Selected values:', slm, jailbreak, category);
        
        if (slm && jailbreak && category) {
            // 检查这个组合在数据中是否存在
            if (jailbreakExamples[slm] && 
                jailbreakExamples[slm][jailbreak] && 
                jailbreakExamples[slm][jailbreak][category]) {
                displayJailbreakExample(slm, jailbreak, category);
            } else {
                displayContainer.innerHTML = '<div style="text-align: center; padding: 20px;">No example available for this combination.</div>';
            }
        }
    }
    
    // 为所有下拉菜单添加事件监听器
    slmSelect.addEventListener('change', checkAllSelected);
    jailbreakSelect.addEventListener('change', checkAllSelected);
    categorySelect.addEventListener('change', checkAllSelected);
}

// 设置defense示例
function setupDefenseExamples() {
    console.log('设置防御示例...');

    // 添加初始化检查
    if (defenseExamplesInitialized) {
        console.log('防御示例已初始化，跳过重复初始化');
        return;
    }
    defenseExamplesInitialized = true;
    
    const slmSelect = document.getElementById('defense-slm-select');
    const jailbreakSelect = document.getElementById('defense-jailbreak-select');
    const defenseSelect = document.getElementById('defense-method-select');
    const categorySelect = document.getElementById('defense-category-select');
    const displayContainer = document.getElementById('defense-example-display');
    
    if (!slmSelect || !jailbreakSelect || !defenseSelect || !categorySelect || !displayContainer) {
        console.warn('防御示例相关的DOM元素未找到:', {
            slmSelect: !!slmSelect,
            jailbreakSelect: !!jailbreakSelect,
            defenseSelect: !!defenseSelect,
            categorySelect: !!categorySelect,
            displayContainer: !!displayContainer
        });
        return;
    }
    
    console.log('已找到所有防御示例相关的DOM元素');
    
    // 检查是否所有下拉菜单都已选择
    function checkAllSelected() {
        const slm = slmSelect.value;
        const jailbreak = jailbreakSelect.value;
        const defense = defenseSelect.value;
        const category = categorySelect.value;
        console.log('选择的防御值:', {slm, jailbreak, defense, category});
        
        // 如果JSON数据尚未加载完成，显示加载提示
        if (Object.keys(defenseExamples).length === 0) {
            console.log('defense_examples数据尚未加载完成');
            displayContainer.innerHTML = '<div style="text-align: center; padding: 20px;">Loading defense examples data... Please try again in a moment.</div>';
            return;
        }
        
        if (slm && jailbreak && defense && category) {
            // 检查这个组合在数据中是否存在
            console.log('检查数据是否存在:', {slm, jailbreak, defense, category});
            console.log('可用的SLM键:', Object.keys(defenseExamples));
            
            if (defenseExamples[slm]) {
                console.log(`SLM "${slm}"的jailbreak方法:`, Object.keys(defenseExamples[slm]));
                
                if (defenseExamples[slm][jailbreak]) {
                    console.log(`Jailbreak "${jailbreak}"的defense方法:`, Object.keys(defenseExamples[slm][jailbreak]));
                    
                    if (defenseExamples[slm][jailbreak][defense]) {
                        console.log(`Defense "${defense}"的category类别:`, Object.keys(defenseExamples[slm][jailbreak][defense]));
                    } else {
                        console.log(`未找到defense "${defense}"的数据`);
                    }
                } else {
                    console.log(`未找到jailbreak "${jailbreak}"的数据`);
                }
            } else {
                console.log(`未找到SLM "${slm}"的数据`);
            }
            
            if (defenseExamples[slm] && 
                defenseExamples[slm][jailbreak] && 
                defenseExamples[slm][jailbreak][defense] && 
                defenseExamples[slm][jailbreak][defense][category]) {
                console.log('找到匹配的防御示例数据');
                displayDefenseExample(slm, jailbreak, defense, category);
            } else {
                console.log('未找到匹配的防御示例数据');
                displayContainer.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <p>No example available for this combination.</p>
                        <p style="color: #777; font-size: 0.9em;">Please try a different combination of SLM, jailbreak method, defense method, and category.</p>
                        <p style="color: #777; font-size: 0.8em;">Debug info: SLM="${slm}", Jailbreak="${jailbreak}", Defense="${defense}", Category="${category}"</p>
                    </div>`;
            }
        } else {
            // 提供友好提示，指导用户完成选择
            const missingSelections = [];
            if (!slm) missingSelections.push("SLM");
            if (!jailbreak) missingSelections.push("jailbreak method");
            if (!defense) missingSelections.push("defense method");
            if (!category) missingSelections.push("risk category");
            
            if (missingSelections.length > 0) {
                displayContainer.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <p>Please select ${missingSelections.join(", ")} to view defense examples.</p>
                    </div>`;
            }
        }
    }
    
    // 为所有下拉菜单添加事件监听器
    slmSelect.addEventListener('change', checkAllSelected);
    jailbreakSelect.addEventListener('change', checkAllSelected);
    defenseSelect.addEventListener('change', checkAllSelected);
    categorySelect.addEventListener('change', checkAllSelected);
    
    // 初始检查 - 如果需要显示初始状态
    checkAllSelected();
}

// 显示jailbreak示例
function displayJailbreakExample(slm, jailbreak, category) {
    const displayContainer = document.getElementById('jailbreak-example-display');
    if (!displayContainer) return;
    
    displayContainer.innerHTML = ''; // 清除之前的内容
    
    if (!jailbreakExamples[slm] || !jailbreakExamples[slm][jailbreak] || !jailbreakExamples[slm][jailbreak][category]) {
        displayContainer.innerHTML = '<div style="text-align: center; padding: 20px;">No example available for this combination.</div>';
        return;
    }
    
    const exampleData = jailbreakExamples[slm][jailbreak][category];
    const question = exampleData[0];
    const prompt = exampleData[1];
    const response = exampleData[2];
    const label = exampleData[3]; // 从示例数据中提取标签
    
    // 创建问题显示，顶部带有打字机效果
    displayQuestionWithTypewriter(displayContainer, question);
    
    // 创建并显示消息
    setTimeout(() => {
        displayPromptMessage(displayContainer, prompt, "prompt-message", "Jailbreak Prompt");
        
        setTimeout(() => {
            displayResponseWithTypewriter(displayContainer, response, "response-message", "SLM Response", label);
        }, 1000);
    }, 3000); // 问题打字机完成后的延迟
}

// 显示defense示例
function displayDefenseExample(slm, jailbreak, defense, category) {
    const displayContainer = document.getElementById('defense-example-display');
    if (!displayContainer) return;
    
    displayContainer.innerHTML = ''; // 清除之前的内容
    
    if (!defenseExamples[slm] || !defenseExamples[slm][jailbreak] || !defenseExamples[slm][jailbreak][defense] || !defenseExamples[slm][jailbreak][defense][category]) {
        displayContainer.innerHTML = '<div style="text-align: center; padding: 20px;">No example available for this combination.</div>';
        return;
    }
    
    const exampleData = defenseExamples[slm][jailbreak][defense][category];
    console.log('Defense example data:', exampleData); // Debug日志
    
    const question = exampleData[0];
    const jailbreakPrompt = exampleData[1];
    const defensePrompt = exampleData[2];
    const response = exampleData[3];
    const label = exampleData[4]; // 从示例数据中提取标签
    console.log('Extracted defense label:', label); // Debug日志
    
    // 创建问题显示，顶部带有打字机效果
    displayQuestionWithTypewriter(displayContainer, question);
    
    // 根据防御方法获取适当的标题
    let defenseTitle;
    switch(defense) {
        case "PPL":
            defenseTitle = "PPL Score";
            break;
        case "Llama Guard 3-1B":
            defenseTitle = "Llama-Guard-3-1B Output";
            break;
        case "Retokenization":
            defenseTitle = "Retokenized Prompt";
            break;
        case "Self-Reminder":
            defenseTitle = "Prompt with Self-Reminder";
            break;
        default:
            defenseTitle = "Defense Prompt";
    }
    
    // 创建并显示消息
    setTimeout(() => {
        displayPromptMessage(displayContainer, jailbreakPrompt, "prompt-message", "Jailbreak Prompt");
        
        setTimeout(() => {
            // PPL防御方法的特殊处理
            if (defense === "PPL") {
                // 尝试从防御提示中解析PPL分数
                try {
                    // 确保defensePrompt是一个字符串，然后使用match
                    const defensePromptStr = String(defensePrompt);
                    const pplScoreMatch = defensePromptStr.match(/(\d+(\.\d+)?)/);
                    if (pplScoreMatch) {
                        const pplScore = parseFloat(pplScoreMatch[0]);
                        const threshold = 415.87;
                        
                        let formattedDefensePrompt;
                        if (pplScore < threshold) {
                            formattedDefensePrompt = `${pplScore} (< threshold ${threshold}, passed)`;
                        } else {
                            formattedDefensePrompt = `${pplScore} (≥ threshold ${threshold}, filtered)`;
                        }
                        
                        displayPromptMessage(displayContainer, formattedDefensePrompt, "defense-message", defenseTitle);
                    } else {
                        // 如果没有找到数字，则使用回退
                        displayPromptMessage(displayContainer, defensePromptStr, "defense-message", defenseTitle);
                    }
                } catch (e) {
                    console.error('Error parsing PPL score:', e);
                    displayPromptMessage(displayContainer, String(defensePrompt), "defense-message", defenseTitle);
                }
            } else {
                // 其他防御方法的正常显示
                displayPromptMessage(displayContainer, defensePrompt, "defense-message", defenseTitle);
            }
            
            setTimeout(() => {
                displayResponseWithTypewriter(displayContainer, response, "response-message", "SLM Response", label);
            }, 1000);
        }, 1000);
    }, 3000); // 问题打字机完成后的延迟
}

// 带打字机效果显示问题
function displayQuestionWithTypewriter(container, text) {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-display';
    
    // 为前缀文本创建一个包装器
    const prefixSpan = document.createElement('span');
    prefixSpan.textContent = "Harmful question: ";
    prefixSpan.style.fontWeight = "bold";
    questionDiv.appendChild(prefixSpan);
    
    container.appendChild(questionDiv);
    
    // 逐个字符应用打字机效果
    let i = 0;
    const speed = 30; // 问题的打字速度
    
    function typeWriter() {
        if (i < text.length) {
            questionDiv.appendChild(document.createTextNode(text[i]));
            i++;
            setTimeout(typeWriter, speed);
        }
    }
    
    // 开始输入文本
    typeWriter();
}

// 显示提示消息
function displayPromptMessage(container, text, className, title) {
    const messageDiv = document.createElement('div');
    messageDiv.className = className;
    
    const messageTitle = document.createElement('span');
    messageTitle.className = 'message-title';
    messageTitle.textContent = title;
    messageDiv.appendChild(messageTitle);
    
    messageDiv.appendChild(document.createTextNode(text));
    container.appendChild(messageDiv);
}

// 带打字机效果显示响应
function displayResponseWithTypewriter(container, text, className, title, label) {
    console.log('displayResponseWithTypewriter received label:', label); // Debug日志
    const messageDiv = document.createElement('div');
    messageDiv.className = className;
    
    const messageTitle = document.createElement('span');
    messageTitle.className = 'message-title';
    messageTitle.textContent = title;
    messageDiv.appendChild(messageTitle);
    
    container.appendChild(messageDiv);
    
    // 应用打字机效果
    let i = 0;
    const speed = 3; // 加快打字速度（原来是10）
    
    function typeWriter() {
        if (i < text.length) {
            messageDiv.appendChild(document.createTextNode(text[i]));
            i++;
            setTimeout(typeWriter, speed);
        } else {
            // 打字完成后，添加标签
            if (label !== undefined) {
                console.log('Adding label element:', label); // Debug日志
                const labelDiv = document.createElement('div');
                labelDiv.className = 'response-label ' + (label === 0 ? 'safe' : 'unsafe');
                if (label === 0) {
                    labelDiv.textContent = "Jailbreak Fail";
                } else {
                    labelDiv.textContent = "Jailbreak Success!"
                }
                // labelDiv.textContent = "Label: " + label;

                // 将标签添加到响应消息下方，而不是其中
                container.appendChild(labelDiv);
            } else {
                console.log('No label provided to add'); // Debug日志
            }
        }
    }
    
    typeWriter();
}

// 在页面点击空白处时关闭下拉内容
function closeDropdownsOnOutsideClick(event) {
    // 获取所有活跃的下拉内容
    const activeContents = document.querySelectorAll('.content-display.active');
    
    // 检查是否点击了下拉内容区域外的地方
    let clickedOutside = true;
    
    // 检查是否点击了下拉选择器
    const allSelects = document.querySelectorAll('.custom-select');
    allSelects.forEach(select => {
        if (select.contains(event.target) || select === event.target) {
            clickedOutside = false;
        }
    });
    
    // 检查是否点击了内容区域内部
    activeContents.forEach(content => {
        if (content.contains(event.target) || content === event.target) {
            clickedOutside = false;
        }
    });
    
    // 如果点击了外部区域，关闭所有活跃的下拉内容
    if (clickedOutside && activeContents.length > 0) {
        activeContents.forEach(content => {
            content.classList.remove('active');
        });
    }
}

// 设置清除终端按钮
function setupClearTerminalButton() {
    console.log('Setting up terminal buttons...');
    
    const clearButton = document.getElementById('clear-terminal');
    const toggleButton = document.getElementById('toggle-terminal');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalContent = document.getElementById('terminal-content');
    const toggleIcon = document.getElementById('toggle-icon');
    const toggleText = document.getElementById('toggle-text');
    
    console.log('Terminal elements found:', {
        clearButton: !!clearButton,
        toggleButton: !!toggleButton,
        terminalOutput: !!terminalOutput,
        terminalContent: !!terminalContent,
        toggleIcon: !!toggleIcon,
        toggleText: !!toggleText
    });
    
    if (!clearButton || !terminalOutput) {
        console.log('清除终端按钮或终端输出元素未找到');
        return;
    }
    
    // 初始化终端内容
    if (terminalOutput.innerHTML.trim() === '') {
        const timestamp = new Date().toLocaleTimeString();
        terminalOutput.innerHTML = `<div class="terminal-line">[${timestamp}] SLM Jailbreak Terminal initialized</div>`;
        terminalOutput.innerHTML += `<div class="terminal-line">[${timestamp}] Ready to test jailbreak methods on SLMs</div>`;
        terminalOutput.innerHTML += `<div class="terminal-line">[${timestamp}] Select an SLM family, model, and jailbreak method to begin</div>`;
        terminalOutput.innerHTML += `<div class="terminal-line">--------------------------------------------------</div>`;
    }
    
    clearButton.addEventListener('click', function(event) {
        console.log('清除终端按钮被点击');
        terminalOutput.innerHTML = '';
        event.preventDefault(); // 防止事件冒泡
        event.stopPropagation(); // 阻止事件传播
    });
    
    // 添加折叠/展开终端功能
    if (toggleButton && terminalContent && toggleIcon && toggleText) {
        console.log('设置终端折叠功能');
        
        // 确保初始状态是展开的
        terminalContent.classList.remove('collapsed');
        toggleIcon.textContent = '▼';
        toggleText.textContent = 'Fold';
        
        toggleButton.addEventListener('click', function(event) {
            console.log('折叠/展开按钮被点击');
            
            // 切换折叠状态
            const isCurrentlyCollapsed = terminalContent.classList.contains('collapsed');
            
            if (isCurrentlyCollapsed) {
                // 如果当前是折叠的，则展开
                terminalContent.classList.remove('collapsed');
                toggleIcon.textContent = '▼';
                toggleText.textContent = 'Fold';
                console.log('终端已展开');
            } else {
                // 如果当前是展开的，则折叠
                terminalContent.classList.add('collapsed');
                toggleIcon.textContent = '▲';
                toggleText.textContent = 'Expand';
                console.log('终端已折叠');
            }
            
            event.preventDefault(); // 防止事件冒泡
            event.stopPropagation(); // 阻止事件传播
        });
    } else {
        console.log('终端折叠按钮或相关元素未找到');
    }
} 