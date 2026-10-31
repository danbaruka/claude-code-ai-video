# Publishing: times, cadence, captions

## Post at your audience's time, not yours

An account run from a different time zone than its audience often posts while that audience sleeps or works. For example, an account run from Nairobi with an audience in France and Québec.

First find where the audience is:
- TikTok Studio → Viewers → Locations;
- YouTube Studio → Audience → Geography;
- Instagram → Insights → Audience.

Then post at **their** local time.

**What the numbers say** (October 2026, French-speaking tech and AI accounts):
- **An account taking off** (43 videos in 21 days, audience in France):
  - its 7 videos above 5,000 views **all** went out between **8 am and 7 pm** Paris time;
  - its 13 videos posted between 7 pm and 2 am never went past 1,700 views;
  - median views by slot:

    | Slot (Paris time) | Median views |
    |---|---|
    | 6-10 am | 345 |
    | 11 am-2 pm | 536 |
    | 3-6 pm | 576 |
    | 7-9 pm | 376 |
    | 10 pm-2 am | 307 |

- **An account starting out** (81 videos):
  - on TikTok, medians are a little better at 9-10 pm (Paris);
  - on YouTube, they are better around 2 pm;
  - its two breakouts went out at 5 pm and 10 pm.
- **YouTube** says posting time has no lasting effect, and **Instagram** says it matters little. Time is a secondary lever: the topic and the hook come first.

**Slots to test**, in the audience's local time:

| Slot | Why |
|---|---|
| 7:30-9 am | morning commute |
| 12-2 pm | lunch break: the safest slot |
| 5-7 pm | leaving work |
| 8:30-9:30 pm | evening: worth testing, it works better for some accounts |

For an audience in both Europe and North America:
- noon in Montréal is 6 pm in Paris, so a good video at 5-6 pm (Paris) reaches both;
- watch the clock changes, which don't happen on the same day. Europe switches to winter time on the last Sunday of October, North America on the first Sunday of November.

## Cadence

- **The safe rhythm for TikTok**: the account we watched posts **1 to 4 videos a day** (2 on average).
- **More videos does not mean more views.** One account went from 11 to 32 videos a week, and its median views were divided by 3.
  - Raise the volume in steps, and only if the median per video holds.
- **For 10 videos a day**, spread them out:
  - YouTube Shorts and Facebook Reels handle volume well;
  - TikTok and Instagram should get only the 3 or 4 best.
  - Leave at least **90 minutes** between two videos on the same network.
  - Never post two videos on the same topic on the same day.
- **A series** ("Part 1, 2, 3") goes out in order, one a day, at the same time.
- **The stop rule**: if the 48-hour median drops by more than a third after 3 days at a given pace, go back to the previous step.

## On publishing day

1. Set the cover: `<id>-couverture.jpg`, which is frame 1. On YouTube, choose it in the app; on Instagram, under "Cover".
2. Take the title and caption from `<id>.txt`. Keep 3 to 5 precise hashtags.
3. Pin the comment from `<id>.txt` **within the first minute**.
4. Reply to comments in the first hour: that is when the video's fate is decided.
5. Note the views at 48 hours and the percentage watched. These two numbers judge the hook and the topic.

## The "AI-generated content" checkbox

- **When it is required**: platforms ask for it when the video shows **realistic** content that could mislead. That means a realistic generated face or scene, or the cloned voice of a real person. This is true on TikTok, on YouTube ("altered or synthetic content") and on Meta.
- **When it usually is not**: animations, diagrams, animated text and a generic synthetic voice. That is what this skill produces in generated mode.
- If you clone your own voice or add realistic generated images, tick the box.
- **Nothing requires you to write "AI" in the caption.** What counts is the platform's checkbox, when it applies.

## Scheduling a batch

- Keep a table with, for each video: number, date, audience time, UTC time, networks, JSON id, title.
- A scheduler (Postiz, Buffer, Metricool) can post everything from that table.
- Never schedule anything without the explicit go-ahead of the person who publishes: a video goes out under their name.
