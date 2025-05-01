import os
import json
import argparse
import numpy as np
import pandas as pd

method_list = ['DirectRequest', 'HumanJailbreaks', 'PAP', 'GCG', 'AutoPrompt', 'PEZ', 'GBDA', 'UAT']
category_list = ['Children Harm', 'Economic Harm', 'Financial Advice', 'Fraud', 'Gov Decision', 'Hate Speech', 'Health Consultation', 'Illegal Activity', 'Legal Opinion', 'Malware', 'Physical Harm', 'Political Lobbying', 'Pornography', 'Privacy Violence']


# 每个slm family选择一个slm
slm_family_to_slm = {
    "LLaMA 3.2 family": "llama3_2_1b_instruct",
    "DeepSeek-RL family": "DeepSeek-R1-Distill-Qwen-1.5B",
    "Qwen family": "qwen2_5_3b_instruct",
    "Gemma family": "gemma-2b-it",
    "Phi family": "phi_3_mini_4k_instruct",
    "MiniCPM family": "minicpm-2B-dpo-bf16",
    "H2O-Danube family": "h2o-danube3-500m-chat",
    "SmolLM family": "smollm2-1.7B-instruct",
    "StableLM family": "stablelm-2-1_6b-chat",
    "TinyLlama family": "tinyllama-1.1B-chat-v0.6",
    "MobileLLaMA family": "mobilellama-1.4B-chat",
    "MobiLlama family": "mobillama-0.5B-chat",
    "Fox family": "fox-1-1.6B-Instruct-v0.1",
    "Dolly family": "dolly-v2-3b",
    "OLMo family": "OLMo-7B-Instruct-hf"
}


parser = argparse.ArgumentParser(description='Count scores for each method and model.')

parser.add_argument('--base_path', type=str, default='/data2/zwh/HarmBench/results_full_70/', help='Base path of the results directory.')
parser.add_argument('--question_num_per_category', type=int, default=5, help='Number of questions in the test set.')
parser.add_argument('--id_map_file_path', type=str, default='/data2/zwh/HarmBench/data/zwh_others/id_map.json', help='Path to the id_map.json file.')
parser.add_argument('--category_file_path', type=str, default='/data2/zwh/HarmBench/data/zwh_others/final_adjusted_advbench.csv', help='Path to the final_adjusted_advbench.csv file.')
parser.add_argument('--output_file', type=str, default='/data2/zwh/demos/SLM_Jailbreak_website/jailbeak_examples.json', help='Path to save the results summary.')

args = parser.parse_args()

if __name__ == '__main__':
    base_path = args.base_path
    question_num_per_category = args.question_num_per_category

    results_summary = {}

    # 读取 id_map
    with open(args.id_map_file_path, 'r') as id_map_file:
        id_map = json.load(id_map_file)

    # 读取 final_adjusted_advbench.csv，获取类别信息
    category_df = pd.read_csv(args.category_file_path, index_col=0)  # 使用第一列作为索引
    # 得到category: [id1, id2, ...]的映射
    category_to_ids = {}
    for index, row in category_df.iterrows():
        category = row['category']
        if category not in category_to_ids:
            category_to_ids[category] = []
        category_to_ids[category].append(index)  # 使用索引作为id

    # 遍历 method_list 和 model_list
    for family, model in slm_family_to_slm.items():
        print(f"  Processing family {family} model {model}")
        if family not in results_summary:
            results_summary[family] = {}

        for method in method_list:
            print(f"Processing method {method}")
            if method not in results_summary:
                results_summary[family][method] = {}

            # 构建checked_result_path
            if method == 'DirectRequest':
                checked_result_path = os.path.join(base_path, method, 'default', 'results', f'{model}.json')
            elif method == 'HumanJailbreaks':
                checked_result_path = os.path.join(base_path, method, 'random_subset_5', 'results', f'{model}.json')
            elif method == 'PAP':
                checked_result_path = os.path.join(base_path, method, 'top_5', 'results', f'{model}.json')
            else:
                checked_result_path = os.path.join(base_path, method, model, 'results', f'{model}.json')

            checked_result_path = checked_result_path.replace("\\", "/")

            if os.path.exists(checked_result_path):
                # 加载实验结果
                with open(checked_result_path, 'r') as result_file:
                    result_data = json.load(result_file)

                # 使用id_map映射
                result_data = {id_map[key]: value for key, value in result_data.items()}

            else:
                print(f"Error: Result file not found: {checked_result_path}")
                continue

            # 为每个类别单独进行统计
            for category, ids in category_to_ids.items():
                # 在该类别的id中随机挑选一个
                selected_id = np.random.choice(ids, 1, replace=False).tolist()[0]
                question = category_df.loc[selected_id, 'goal']
                results_summary[model][method][category] = [
                    question, 
                    result_data[selected_id][0]["test_case"], 
                    result_data[selected_id][0]["generation"], 
                    result_data[selected_id][0]["label"]
                ]

    # 保存最终结果
    with open(args.output_file, 'w') as json_file:
        json.dump(results_summary, json_file, indent=4)

    print(f"Results summary by category saved to {args.output_file}.")


