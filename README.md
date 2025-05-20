# SLM Jailbreak Website

This repository contains the code for the "Can Small Language Model Reliably Resist Jailbreak Attack?" research website.

## Overview

This project presents a comprehensive evaluation of jailbreak attacks on small language models (SLMs). The website showcases our research findings, methodology, and examples of various jailbreak techniques and defenses.

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
python -m http.server 8005
```

Then open your browser and navigate to:
```
http://localhost:8005
```

## Project Structure

The website uses a component-based architecture for better organization:

```
SLM_Jailbreak_website/
├── index.html              # Main website entry point
├── leaderboard.html        # Leaderboard page showing model performance
├── requirements.txt        # Python dependencies
├── create_jailbreak_examples.py  # Script for generating jailbreak examples
├── README.md               # This file
└── website/                # Website assets and components
    ├── components/         # HTML components loaded dynamically
    │   ├── header.html     # Website header component
    │   ├── hero.html       # Hero/banner section component
    │   ├── overview.html   # Project overview component
    │   ├── results.html    # Research results component
    │   ├── ethics.html     # Ethics statement component
    │   └── footer.html     # Footer component
    ├── examples/           # Jailbreak and defense examples data
    │   ├── jailbreak_examples.json  # Examples of jailbreak attacks
    │   └── defense_examples.json    # Examples of defense techniques
    ├── images/             # Website images and media assets
    ├── js/                 # JavaScript files
    │   ├── main.js         # Main website functionality
    │   └── leaderboard.js  # Leaderboard page functionality
    ├── styles/             # CSS stylesheets
    │   ├── main.css        # Main website styles
    │   └── leaderboard.css # Leaderboard page styles
    └── tables/             # Data tables for results display
```

## Customizing Jailbreak Examples

There are two ways to add or modify jailbreak examples:

### Method 1: Edit the JSON files

Edit the `website/examples/jailbreak_examples.json` or `website/examples/defense_examples.json` files directly. The website will automatically load the examples from these files.

Format example:
```json
{
  "category": {
    "slm_name": {
      "attack_method": ["question", "prompt", "response"]
    }
  }
}
```

### Method 2: Use the create_jailbreak_examples.py script

You can use the provided Python script to generate or modify jailbreak examples programmatically.

## Website Architecture

The website uses a modular component-based architecture:

1. **Main Index**: The `index.html` file serves as the entry point and loads all components dynamically
2. **Components**: Individual HTML components in the `website/components/` directory are loaded at runtime
3. **Styling**: CSS is organized in the `website/styles/` directory
4. **JavaScript**: Frontend functionality is implemented in the `website/js/` directory
5. **Examples**: Jailbreak and defense examples are stored as JSON in the `website/examples/` directory

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