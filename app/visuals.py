"""
Visual Analytics Module
Generates comparison charts for top candidates using Matplotlib and Seaborn.
"""
import matplotlib
matplotlib.use('Agg')  # Required for server-side generation
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import io
import base64
from typing import List
from app.models import ScoredCandidate

def generate_comparison_chart(scored_candidates: List[ScoredCandidate]) -> str:
    """Creates a bar chart comparing candidates and returns base64 image string."""
    if not scored_candidates:
        return ""
        
    data = []
    for sc in scored_candidates:
        data.append({
            "Candidate": sc.candidate.name,
            "Technical": sc.technical_fit_score,
            "Experience": sc.experience_fit_score,
            "Contextual": sc.contextual_fit_score
        })
        
    df = pd.DataFrame(data)
    df_melted = df.melt(id_vars="Candidate", var_name="Metric", value_name="Score")
    
    plt.figure(figsize=(10, 6))
    
    # Modern, professional styling
    sns.set_theme(style="whitegrid")
    ax = sns.barplot(x="Metric", y="Score", hue="Candidate", data=df_melted, palette="viridis")
    
    plt.title("Top Candidates Competency Comparison", fontsize=16, fontweight='bold', pad=20)
    plt.ylim(0, 10)
    plt.ylabel("Score (0-10)", fontweight='bold')
    plt.xlabel("", fontweight='bold')
    
    # Legend outside
    plt.legend(bbox_to_anchor=(1.05, 1), loc=2, borderaxespad=0.)
    plt.tight_layout()
    
    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=150, bbox_inches="tight")
    buf.seek(0)
    img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
    plt.close()
    
    return f"data:image/png;base64,{img_base64}"
