# Ruilarts Presentation

## Circular Matching for Huisarts Practice Swaps

This folder contains a comprehensive presentation about the Ruilarts project, built during a hackathon on November 3-4, 2025.

---

## 📁 Presentation Structure

The presentation is organized into 14 sections (slides):

1. **00-cover.md** - Title slide and team intro
2. **01-the-problem.md** - Problem statement and opportunity
3. **02-the-solution.md** - How circular matching works
4. **03-tech-stack.md** - Technologies and frameworks used
5. **04-architecture.md** - System design and architecture
6. **05-matching-algorithm.md** - Core algorithm deep-dive
7. **06-data-flow.md** - How data moves through the system
8. **07-timeline.md** - Development history and milestones
9. **08-key-features.md** - All 15+ features explained
10. **09-challenges-solved.md** - Technical hurdles overcome
11. **10-demo-scenarios.md** - Test cases and examples
12. **11-current-state.md** - What works now
13. **12-future-enhancements.md** - Roadmap and vision
14. **13-key-takeaways.md** - Lessons learned and summary

---

## 🎯 Purpose

This presentation serves multiple purposes:

- **Hackathon Demo**: Show what was built in 36 hours
- **Technical Deep-Dive**: Explain architecture and algorithms
- **Product Pitch**: Demonstrate value and potential
- **Documentation**: Record decisions and learnings
- **Team Reference**: Onboarding and knowledge sharing

---

## 📖 How to Use

### Reading Order

**Full Presentation (60-90 minutes):**
Read all files in order (00 → 13)

**Executive Summary (15 minutes):**
- 00-cover.md
- 01-the-problem.md
- 02-the-solution.md
- 11-current-state.md
- 13-key-takeaways.md

**Technical Deep-Dive (30 minutes):**
- 03-tech-stack.md
- 04-architecture.md
- 05-matching-algorithm.md
- 06-data-flow.md

**Project Management (20 minutes):**
- 07-timeline.md
- 09-challenges-solved.md
- 12-future-enhancements.md

---

## 🎨 Viewing Options

### 0. Reveal.js Deck (built-in)

- Open `presentation/index.html` in a browser via a local web server (e.g. `npx http-server presentation` or `python -m http.server` from the repo root).
- Use arrow keys to navigate horizontally; vertical stacks are separated with `--` markers.
- Append `#/` fragments to the URL when deep-linking to specific slides (hash navigation is enabled).
- The opening slide stack is sourced from `00-cover.html`, which keeps Reveal-specific markup separate from the original markdown content.

### 1. Markdown Readers

**GitHub/GitLab:**
- Upload to repo
- View in browser
- Native markdown rendering

**VS Code:**
- Open folder
- Install "Markdown Preview Enhanced"
- Preview side-by-side

**Obsidian:**
- Import folder as vault
- Link between slides
- Graph view

### 2. Slide Converters

**Marp (Recommended):**
```bash
npm install -g @marp-team/marp-cli

# Convert to PDF
marp prezi/*.md --pdf --output ruilarts-presentation.pdf

# Convert to HTML
marp prezi/*.md --html --output presentation.html

# Watch mode
marp -w prezi/
```

**Slidev:**
```bash
npm init slidev@latest

# Copy slides to slides.md
# Run dev server
npm run dev
```

**Reveal.js:**
```bash
# Use reveal-md
npm install -g reveal-md

reveal-md prezi/*.md --theme solarized
```

### 3. PDF Export

**Via Marp:**
```bash
marp --pdf --allow-local-files prezi/*.md
```

**Via Pandoc:**
```bash
pandoc prezi/*.md -o presentation.pdf
```

**Via Browser:**
- Open in markdown preview
- Print to PDF

---

## 🎯 Target Audiences

### Developers
- Focus on: 04, 05, 06, 09
- Technical depth
- Code examples
- Architecture decisions

### Product Managers
- Focus on: 01, 02, 08, 11, 12
- Features and roadmap
- User stories
- Market opportunity

### Executives
- Focus on: 00, 01, 02, 13
- Problem and solution
- Business potential
- Key metrics

### Investors
- Focus on: 01, 02, 11, 12, 13
- Market size
- Competition
- Growth plan
- Team capability

---

## 📊 Content Overview

### Total Content

- **Files:** 14 markdown files
- **Words:** ~25,000 words
- **Reading Time:** ~2 hours
- **Presentation Time:** 60-90 minutes
- **Code Examples:** 100+
- **Diagrams:** 20+ (ASCII art)

### Key Sections Breakdown

**Problem & Solution (20%):**
- What problem we're solving
- How our solution works
- Why it's better

**Technical Implementation (40%):**
- Architecture and design
- Algorithms and data structures
- Code examples and patterns

**Development Process (20%):**
- Timeline and milestones
- Challenges and solutions
- Team and workflow

**Future Vision (20%):**
- Current capabilities
- Roadmap and enhancements
- Long-term goals

---

## 🎭 Presentation Tips

### For Live Presentations

**Timing:**
- 5 minutes per section average
- Adjust based on audience
- Leave time for questions

**What to Show:**
- Start with cover (context)
- Show problem (empathy)
- Demo solution (wow factor)
- Explain how it works (credibility)
- Show what's next (vision)

**What to Skip:**
- Deep technical details (unless technical audience)
- All code examples (highlight key ones)
- Complete timeline (just milestones)

### For Different Durations

**5-Minute Pitch:**
- Problem (1 min)
- Solution demo (2 min)
- Tech highlights (1 min)
- Next steps (1 min)

**15-Minute Demo:**
- Cover + Problem (3 min)
- Solution + Demo (5 min)
- Architecture (4 min)
- Wrap-up (3 min)

**30-Minute Deep-Dive:**
- Problem + Solution (5 min)
- Tech stack (5 min)
- Algorithm (10 min)
- Current state (5 min)
- Future + Q&A (5 min)

**60-Minute Workshop:**
- Full presentation
- Live coding demo
- Architecture walkthrough
- Q&A session

---

## 🔗 Related Resources

### In This Repository

- `/src` - Source code
- `/docker-compose.yml` - Deployment
- `/bruno` - API collection
- `/README.md` - Project README

### External Links

- Neo4j Documentation
- Hono Framework
- React + TanStack
- PostgreSQL

### Live Demo

```bash
# Run the application
docker-compose up

# Access
- Frontend: http://localhost:3000
- API: http://localhost:8000
- Neo4j: http://localhost:7474
```

---

## 📝 Customization

### For Your Own Presentation

**Edit Any Slide:**
```bash
# Open in editor
code prezi/05-matching-algorithm.md

# Make changes
# Save
```

**Add New Slides:**
```bash
# Create new file
touch prezi/14-my-topic.md

# Follow naming convention
# Update this README
```

**Change Order:**
```bash
# Rename files
mv prezi/07-timeline.md prezi/08-timeline.md
mv prezi/08-features.md prezi/07-features.md
```

**Customize Content:**
- Update team names
- Change company logo
- Modify statistics
- Add new sections

---

## 🎨 Styling

### Markdown Features Used

**Headers:**
```markdown
# Main Title
## Section
### Subsection
```

**Code Blocks:**
```typescript
// Syntax highlighted
const example = "code";
```

**Lists:**
```markdown
- Bullet point
1. Numbered list
```

**Emphasis:**
```markdown
**Bold** *Italic* `Code`
```

**ASCII Diagrams:**
```
┌─────┐
│ Box │
└─────┘
```

---

## 🚀 Next Steps

### After Viewing

1. **Try the Demo:**
   ```bash
   docker-compose up
   ```

2. **Read the Code:**
   ```bash
   code src/
   ```

3. **Test the API:**
   ```bash
   # Open Bruno
   bruno prezi/
   ```

4. **Provide Feedback:**
   - What was clear?
   - What needs explanation?
   - What's missing?

---

## 🤝 Contributing

### Improvements Welcome

**Content:**
- Clarify confusing sections
- Add missing details
- Fix typos
- Update outdated info

**Formatting:**
- Better diagrams
- Improved structure
- Additional examples
- Visual enhancements

**Translations:**
- Dutch version
- Other languages
- Localized examples

**How to Contribute:**
1. Fork repository
2. Make changes
3. Submit pull request
4. We'll review!

---

## 📄 License

This presentation is part of the Ruilarts project.

- Code: MIT License
- Content: Creative Commons BY-SA 4.0
- Free to use, share, adapt (with attribution)

---

## 📞 Contact

**Team:**
- Tobias Termeczky
- Lennard
- JP
- Jan Martijn

**Email:** team@ruilarts.nl
**GitHub:** github.com/ruilarts
**Website:** ruilarts.nl

---

## 🙏 Acknowledgments

**Created By:**
- Team Ruilarts
- November 2025
- 36 hours of intense work

**Built With:**
- ❤️ Passion
- ☕ Coffee
- 💡 Ideas
- 👥 Collaboration

**Special Thanks:**
- Hackathon organizers
- Coffee suppliers
- Pizza deliverers
- Our families (for patience)

---

## 📚 Additional Reading

### Recommended Order for New Team Members

1. **Start Here:**
   - 00-cover.md (Who we are)
   - 01-the-problem.md (Why we exist)
   - 02-the-solution.md (What we built)

2. **Understand the Tech:**
   - 03-tech-stack.md (Technologies)
   - 04-architecture.md (System design)
   - 05-matching-algorithm.md (Core logic)

3. **See It in Action:**
   - 10-demo-scenarios.md (Examples)
   - 11-current-state.md (What works)

4. **Learn from Experience:**
   - 07-timeline.md (How we built it)
   - 09-challenges-solved.md (Problems faced)

5. **Think About Future:**
   - 12-future-enhancements.md (Where we're going)
   - 13-key-takeaways.md (Lessons learned)

---

## 🎯 Quick Reference

### File Sizes
```
00-cover.md:             ~500 words
01-the-problem.md:       ~800 words
02-the-solution.md:      ~1,200 words
03-tech-stack.md:        ~1,500 words
04-architecture.md:      ~2,500 words
05-matching-algorithm.md: ~3,000 words
06-data-flow.md:         ~2,200 words
07-timeline.md:          ~2,800 words
08-key-features.md:      ~3,500 words
09-challenges-solved.md: ~3,200 words
10-demo-scenarios.md:    ~2,400 words
11-current-state.md:     ~2,600 words
12-future-enhancements.md: ~3,800 words
13-key-takeaways.md:     ~3,000 words

Total: ~25,000 words
```

### Reading Times
```
Cover:           2 min
Problem:         3 min
Solution:        5 min
Tech Stack:      6 min
Architecture:    10 min
Algorithm:       12 min
Data Flow:       9 min
Timeline:        11 min
Features:        14 min
Challenges:      13 min
Demos:           10 min
Current State:   11 min
Future:          15 min
Takeaways:       12 min

Total: ~133 minutes (~2.2 hours)
```

---

## 🎉 Conclusion

This presentation represents 36 hours of intensive development condensed into a comprehensive story. Whether you're here to learn about the technology, understand the product, evaluate the opportunity, or just appreciate the journey, we hope this presentation serves your needs.

**Thank you for your interest in Ruilarts!**

Now go forth and `docker-compose up`! 🚀

---

*Last Updated: November 4, 2025*
*Version: 1.0*
*Status: Complete*
