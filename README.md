# SLM Jailbreak Website

This repository contains the code for the SLM (Small Language Model) Jailbreak research website.

## Setup and Usage

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/SLM_Jailbreak_website.git
cd SLM_Jailbreak_website
```

2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

### Running the Website

The simplest way to run the website is using a simple HTTP server:

```bash
python -m http.server 8000
```

Then open your browser and navigate to:
```
http://localhost:8000
```

### Customizing Jailbreak Examples

There are two ways to add or modify jailbreak examples:

#### Method 1: Directly edit the JSON file

Edit the `jailbreak_examples.json` file directly. The website will automatically load the examples from this file.

Format:
```json
{
  "category": {
    "slm_name": {
      "attack_method": ["question", "prompt", "response"]
    }
  }
}
```

#### Method 2: Use the fallback embedded data

If you prefer not to use external JSON files, you can modify the embedded fallback data in the `index.html` file. This data is used if the JSON file cannot be loaded.

## File Structure

- `index.html`: Main website page with the implementation
- `jailbreak_examples.json`: JSON file containing the jailbreak examples
- `requirements.txt`: Python dependencies
- `website/`: Directory containing website assets (CSS, images, etc.)

## Citation

If you find our project useful, please consider citing:

```
@article{zhang2025can,
  title={Can Small Language Models Reliably Resist Jailbreak Attacks? A Comprehensive Evaluation},
  author={Zhang, Wenhui and Xu, Huiyu and Wang, Zhibo and He, Zeqing and Zhu, Ziqi and Ren, Kui},
  journal={arXiv preprint arXiv:2503.06519},
  year={2025}
}
```