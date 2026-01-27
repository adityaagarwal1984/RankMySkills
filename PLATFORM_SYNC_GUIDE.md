# Platform Data Synchronization Guide

## Overview
TalentTrack now automatically fetches real-time coding platform data from LeetCode, Codeforces, and CodeChef using their public APIs and web scraping techniques.

## Features

### 1. **Automatic Data Fetching**
- **LeetCode**: Uses official GraphQL API to fetch user profile, ranking, and solved problems
- **Codeforces**: Uses public REST API to fetch rating and submission history
- **CodeChef**: Uses web scraping as a fallback with public API endpoints

### 2. **Updated Global Engineer Score Formula**

The new formula provides a more balanced score calculation:

```
GlobalEngineerScore = (
  0.35 × √(clamp((CF - 800) / 2700, 0, 1)) +
  0.30 × √(clamp((LC - 1400) / 1100, 0, 1)) +
  0.25 × √(clamp((CC - 1200) / 1800, 0, 1)) +
  0.10 × √(clamp(TotalSolved / 2000, 0, 1))
) × 1000
```

**Where:**
- **CF** = Codeforces Rating (baseline: 800, max contribution: 3500)
- **LC** = LeetCode Rating (baseline: 1400, max contribution: 2500)
- **CC** = CodeChef Rating (baseline: 1200, max contribution: 3000)
- **TotalSolved** = Total problems solved across all platforms (max: 2000)

**Weights:**
- Codeforces: 35% (highest weight - most competitive platform)
- LeetCode: 30% (interview-focused)
- CodeChef: 25% (balanced competitive programming)
- Total Problems: 10% (consistency and practice)

## How It Works

### Student Workflow

1. **Add Platform Usernames**
   - Navigate to "Edit Profile"
   - Enter usernames for LeetCode, Codeforces, and/or CodeChef
   - Save profile

2. **Sync Data**
   - Go to the "Portfolio" page
   - Click the "Sync Data" button
   - The system will fetch your current ratings and problem counts from all configured platforms

3. **View Results**
   - Updated ratings and problem counts are displayed on the portfolio page
   - Global Engineer Score is automatically recalculated
   - Rankings are updated based on the new score

### Backend Implementation

#### Platform Service (`backend/services/platformService.js`)

**LeetCode Data Fetching:**
```javascript
- Endpoint: https://leetcode.com/graphql
- Method: POST (GraphQL)
- Data Retrieved: Username, ranking, total problems solved
- Rating Calculation: Estimated based on user ranking
```

**Codeforces Data Fetching:**
```javascript
- Endpoint: https://codeforces.com/api/user.info
- Method: GET
- Data Retrieved: Current rating, solved problems (from submission history)
```

**CodeChef Data Fetching:**
```javascript
- Primary: Web scraping from user profile page
- Fallback: Third-party API (codechef-api.vercel.app)
- Data Retrieved: Current rating, fully solved problems
```

#### API Endpoint

**POST** `/api/student/sync-platforms`

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "message": "Successfully synced 3 platform(s)",
  "global_engineer_score": 567,
  "ratings": {
    "leetcode": 1823,
    "codeforces": 1456,
    "codechef": 1789
  },
  "problems_solved": {
    "leetcode": 456,
    "codeforces": 234,
    "codechef": 189
  },
  "results": {
    "leetcode": {
      "success": true,
      "rating": 1823,
      "problems": 456
    },
    "codeforces": {
      "success": true,
      "rating": 1456,
      "problems": 234
    },
    "codechef": {
      "success": true,
      "rating": 1789,
      "problems": 189
    }
  }
}
```

## Error Handling

The system gracefully handles various error scenarios:

1. **Invalid Username**: Returns error message for specific platform
2. **Network Timeout**: 10-second timeout for each platform
3. **Partial Success**: If one platform fails, others still update
4. **No Platforms Configured**: Clear error message prompting user to add usernames

## Technical Details

### Dependencies
- **axios**: HTTP client for API requests and web scraping
- Already included in backend package.json

### Score Calculation Method

The `calculateGlobalEngineerScore()` method in the User model:

1. **Normalization**: Each platform rating is normalized to 0-1 range
2. **Clamping**: Ensures values stay within valid bounds
3. **Square Root**: Applies diminishing returns (prevents dominance by one platform)
4. **Weighted Sum**: Combines normalized scores with platform-specific weights
5. **Scaling**: Multiplies by 1000 for readable scores (0-1000 range)

### Automatic Updates

The score is automatically recalculated when:
- Student syncs platform data
- Admin manually updates ratings
- Platform data is updated via API

## Future Enhancements

Potential improvements for future versions:

1. **Scheduled Auto-Sync**: Cron job to automatically sync data daily/weekly
2. **GeeksForGeeks Integration**: Add GFG rating to the formula
3. **Historical Tracking**: Store rating history and show progress graphs
4. **Cache Layer**: Cache API responses to reduce external API calls
5. **Webhook Support**: Real-time updates when platform ratings change
6. **Rate Limiting**: Implement rate limiting to prevent API abuse

## Troubleshooting

### Common Issues

**1. Sync button shows "Failed to sync"**
- Verify usernames are correct (case-sensitive)
- Check if the platform profile is public
- Ensure stable internet connection

**2. LeetCode data not fetching**
- Make sure username exactly matches LeetCode profile
- Check if LeetCode API is accessible (not blocked by firewall)

**3. CodeChef data inaccurate**
- CodeChef uses web scraping which may break if they update their site
- Fallback API may have stale data

**4. Score not updating**
- Refresh the page after syncing
- Check browser console for errors
- Verify backend server is running

## Security Considerations

- No passwords or API keys are stored
- Only public profile data is accessed
- All requests use HTTPS
- Usernames are validated before fetching
- Timeout prevents indefinite hanging

## Performance

- Parallel fetching from all platforms (non-blocking)
- 10-second timeout per platform
- Efficient score calculation algorithm
- Minimal database queries

---

**Last Updated**: January 27, 2026
**Version**: 1.0.0
