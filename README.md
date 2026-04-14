# OUTER RIM // CANTINA CRAWLER
Target Build Date: May 5, 2026 (Revenge of the 5th)<br/>
Status: Social Utility / Route Orchestrator

## Vision
The definitive guide for the scoundrel-about-town. This app allows users to review drink menus at various Outer Rim cantinas, track "Species-Safe" beverage ratings, and orchestrate optimal pub crawl routes through Mos Eisley while avoiding Imperial checkpoints.

## Technical Stack
+ Framework: React/Next.js (Tailwind CSS)
+ Data Source: cantinas.json (The "Wretched Hive" Registry) 
+ Orchestration Layer: gstack / Claude Code
+ Verification Logic: Approval Interfaces for "Buying a Round" and "Locked Routes."
+ Deployment: Cloud Run

## Core Demo Loops
+ The Menu Normalizer: AI converts messy, multi-currency price lists (Credits, Peggats, Wupiupi) into a standard Credit-based view.
+ The Social Handoff: Mapping blueprint design tokens to a "Crawl Card" that can be shared with droids.
+ The Checkpoint Guard: Human-in-the-loop verification for route adjustments when "Imperial Activity" is detected.
