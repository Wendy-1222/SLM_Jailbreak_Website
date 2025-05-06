/**
 * main.js - 包含所有网站的JavaScript功能
 * 该文件整合了原index.html中的所有内联脚本
 */

// 定义全局变量，跟踪当前激活的内容区域和卡片
var activeContent = null;
var activeCard = null;
// 添加初始化标志
var defenseExamplesInitialized = false;

// 当文档加载完成后运行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded 事件触发');
    // 监听结果容器的变化
    observeResultsContainer();
    
    // 设置滚动导航栏
    setupScrollNavbar();
    
    // 尝试直接调用defense下拉菜单初始化
    try {
        setupDefenseDropdown();
        console.log('Defense下拉菜单初始化完成');
    } catch (e) {
        console.warn('Defense下拉菜单初始化失败：', e);
    }
    
    // 添加延迟检查，确保所有组件加载后再尝试初始化RQ3相关功能
    setTimeout(() => {
        const defense_select = document.getElementById('defense-select');
        const defense_method_select = document.getElementById('defense-method-select');
        
        if (defense_select) {
            console.log('找到defense-select，重新初始化');
            setupDefenseDropdown();
        }
        
        if (defense_method_select) {
            console.log('找到defense-method-select，初始化防御示例相关功能');
            // 不要在这里调用 setupDefenseExamples，让它只在 initializeResults 中调用一次
        }
    }, 1000); // 延迟1秒

    // 添加点击事件，当点击页面空白处时关闭下拉内容
    document.addEventListener('click', function(event) {
        closeDropdownsOnOutsideClick(event);
    });
});

// 其他函数保持不变...

// 修改 setupDefenseExamples 函数
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
    
    // 其余代码保持不变...
}

// 修改 displayDefenseExample 函数，确保在显示前清空容器
function displayDefenseExample(slm, jailbreak, defense, category) {
    const displayContainer = document.getElementById('defense-example-display');
    if (!displayContainer) return;
    
    displayContainer.innerHTML = ''; // 确保清除所有现有内容
    
    // 其余代码保持不变...
}