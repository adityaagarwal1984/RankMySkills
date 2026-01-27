const axios = require('axios');

class PlatformService {
  /**
   * Fetch LeetCode user data using public GraphQL API
   */
  async fetchLeetCodeData(username) {
    try {
      // First query - get basic profile and problems solved
      const profileQuery = `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `;

      // Second query - get contest ranking info
      const contestQuery = `
        query userContestRankingInfo($username: String!) {
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
            topPercentage
          }
          userContestRankingHistory(username: $username) {
            attended
            rating
            ranking
            contest {
              title
            }
          }
        }
      `;

      // Fetch profile data
      const profileResponse = await axios.post('https://leetcode.com/graphql', {
        query: profileQuery,
        variables: { username }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 10000
      });

      if (!profileResponse.data?.data?.matchedUser) {
        return { success: false, error: 'User not found' };
      }

      const user = profileResponse.data.data.matchedUser;
      const totalSolved = user.submitStats?.acSubmissionNum?.find(item => item.difficulty === 'All')?.count || 0;

      // Fetch contest data
      let currentRating = 0;
      let maxRating = 0;

      try {
        const contestResponse = await axios.post('https://leetcode.com/graphql', {
          query: contestQuery,
          variables: { username }
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com',
            'User-Agent': 'Mozilla/5.0'
          },
          timeout: 10000
        });

        if (contestResponse.data?.data?.userContestRanking) {
          currentRating = Math.round(contestResponse.data.data.userContestRanking.rating || 0);
        }

        if (contestResponse.data?.data?.userContestRankingHistory && 
            contestResponse.data.data.userContestRankingHistory.length > 0) {
          const ratings = contestResponse.data.data.userContestRankingHistory
            .filter(h => h.attended)
            .map(h => h.rating || 0);
          if (ratings.length > 0) {
            maxRating = Math.round(Math.max(...ratings));
          }
        }

        // If max rating is less than current, use current as max
        if (maxRating < currentRating) {
          maxRating = currentRating;
        }
      } catch (contestError) {
        console.error('LeetCode contest data fetch error:', contestError.message);
        // Continue with 0 ratings if contest data fetch fails
      }

      return {
        rating: currentRating,
        maxRating: maxRating,
        problemsSolved: totalSolved,
        success: true
      };

    } catch (error) {
      console.error('LeetCode fetch error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch Codeforces user data using public API
   */
  async fetchCodeforcesData(username) {
    try {
      const userInfoResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`, {
        timeout: 10000
      });

      if (userInfoResponse.data?.status === 'OK' && userInfoResponse.data.result?.length > 0) {
        const user = userInfoResponse.data.result[0];
        const rating = user.rating || 0;
        const maxRating = user.maxRating || rating || 0;

        // Try to fetch problem count
        let problemsSolved = 0;
        try {
          const statusResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${username}&from=1&count=10000`, {
            timeout: 10000
          });

          if (statusResponse.data?.status === 'OK') {
            const solvedProblems = new Set();
            statusResponse.data.result.forEach(submission => {
              if (submission.verdict === 'OK') {
                solvedProblems.add(`${submission.problem.contestId}-${submission.problem.index}`);
              }
            });
            problemsSolved = solvedProblems.size;
          }
        } catch (err) {
          console.error('Codeforces problems fetch error:', err.message);
        }

        return {
          rating: rating,
          maxRating: maxRating,
          problemsSolved,
          success: true
        };
      }

      return { success: false, error: 'User not found' };
    } catch (error) {
      console.error('Codeforces fetch error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch CodeChef user data using API first, then web scraping
   */
  async fetchCodeChefData(username) {
    try {
      console.log(`CodeChef: Fetching data for ${username}`);
      
      // Try alternate API endpoints
      const apiEndpoints = [
        `https://www.codechef.com/api/ratings/all?handle=${username}`,
        `https://codechef-api.vercel.app/${username}`
      ];

      for (const endpoint of apiEndpoints) {
        try {
          console.log(`CodeChef: Trying API: ${endpoint}`);
          const apiResponse = await axios.get(endpoint, { timeout: 10000 });

          if (apiResponse.data) {
            let rating = 0, maxRating = 0, problemsSolved = 0;
            
            // Handle different API response formats
            if (apiResponse.data.currentRating !== undefined) {
              rating = apiResponse.data.currentRating || 0;
              maxRating = apiResponse.data.highestRating || rating;
              problemsSolved = apiResponse.data.totalProblemsSolved || 0;
            } else if (apiResponse.data.data) {
              const data = apiResponse.data.data;
              rating = data.rating || 0;
              maxRating = data.max_rating || rating;
            }
            
            if (rating > 0 || maxRating > 0) {
              console.log(`CodeChef: API success - Rating: ${rating}, Max: ${maxRating}, Problems: ${problemsSolved}`);
              return { rating, maxRating, problemsSolved, success: true };
            }
          }
        } catch (apiError) {
          console.log(`CodeChef: API failed: ${apiError.message}`);
        }
      }

      // Fallback: Web scraping with improved patterns
      console.log('CodeChef: Using web scraping');
      const response = await axios.get(`https://www.codechef.com/users/${username}`, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      const html = response.data;
      let rating = 0, maxRating = 0, problemsSolved = 0;

      // Extract rating
      const ratingMatch = html.match(/<div[^>]*class="rating-number[^"]*"[^>]*>(\d+)</i) ||
                         html.match(/rating-number[^>]*>(\d+)/i) ||
                         html.match(/"rating"\s*:\s*"?(\d+)"?/i);
      if (ratingMatch) rating = parseInt(ratingMatch[1]) || 0;

      // Extract max rating - look for "Highest Rating" text
      let maxMatch = html.match(/Highest\s*Rating[^\d]*(\d{3,5})/i);
      if (!maxMatch) {
        maxMatch = html.match(/highest[^\d]{0,30}(\d{3,5})/i);
      }
      if (!maxMatch) {
        maxMatch = html.match(/"highest_rating"\s*:\s*"?(\d+)"?/i);
      }
      if (maxMatch) {
        const max = parseInt(maxMatch[1]);
        if (max >= rating && max <= 5000) {
          maxRating = max;
          console.log(`CodeChef: Max rating: ${maxRating}`);
        }
      }
      if (!maxRating) maxRating = rating;

      // Extract problems solved - try to find the exact section
      console.log('CodeChef: Looking for problems solved...');
      
      // Look for "Fully Solved" section which appears above footer
      const problemsSection = html.match(/<section[^>]*>([\s\S]{0,3000}?)Fully\s+Solved[\s\S]{0,500}?<\/section>/i);
      if (problemsSection) {
        const sectionHtml = problemsSection[0];
        // Look for the number in h5 or strong tags within this section
        const numMatch = sectionHtml.match(/<(?:h5|strong|span)[^>]*>(\d+)<\/(?:h5|strong|span)>/i);
        if (numMatch) {
          problemsSolved = parseInt(numMatch[1]) || 0;
          console.log(`CodeChef: Found in Fully Solved section: ${problemsSolved}`);
        }
      }
      
      if (!problemsSolved) {
        // Alternative: Look for the pattern around "Fully Solved" text
        const patterns = [
          /<h5[^>]*>(\d+)<\/h5>\s*<[^>]*>Fully\s+Solved/i,
          /<strong[^>]*>(\d+)<\/strong>\s*<[^>]*>Fully\s+Solved/i,
          /Fully\s+Solved<\/h3>\s*<h5[^>]*>(\d+)<\/h5>/i,
          /Fully\s+Solved<\/\w+>\s*<\w+[^>]*>(\d+)/i,
          /<div[^>]*>(\d+)<\/div>\s*<[^>]*>Fully\s+Solved/i
        ];
        
        for (const pattern of patterns) {
          const match = html.match(pattern);
          if (match) {
            problemsSolved = parseInt(match[1]) || 0;
            console.log(`CodeChef: Found via pattern: ${problemsSolved}`);
            break;
          }
        }
      }

      const result = { rating, maxRating, problemsSolved, success: true };
      console.log('CodeChef: Final result:', result);
      return result;
      
    } catch (error) {
      console.error('CodeChef error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch GeeksForGeeks user data using web scraping
   */
  async fetchGeeksForGeeksData(username) {
    try {
      console.log(`GFG: Fetching data for ${username}`);
      
      let problemsSolved = 0;
      let codingScore = null;
      let instituteRank = null;
      let instituteName = null;

      // Try the main profile page
      const urls = [
        `https://auth.geeksforgeeks.org/user/${username}`,
        `https://auth.geeksforgeeks.org/user/${username}/practice/`
      ];

      for (const url of urls) {
        try {
          console.log(`GFG: Trying URL: ${url}`);
          const response = await axios.get(url, {
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html',
              'Referer': 'https://www.geeksforgeeks.org/'
            }
          });

          const html = response.data;
          
          // Look for data in very specific patterns to avoid mixing up values
          // Problems Solved - must have "problem" or "question" AND "solved" nearby
          if (!problemsSolved) {
            const patterns = [
              // Pattern: "Total Problems Solved" or "Problems Solved" with number
              /Total\s+Problems?\s+Solved[:\s]*<[^>]*>(\d+)<\/[^>]*>/i,
              /Problems?\s+Solved[:\s]*<[^>]*>(\d+)<\/[^>]*>/i,
              /<[^>]*>(\d+)<\/[^>]*>[^<]{0,20}Total\s+Problems?\s+Solved/i,
              /<[^>]*>(\d+)<\/[^>]*>[^<]{0,20}Problems?\s+Solved/i,
              // JSON patterns
              /"(?:problemsSolved|problems_solved|totalProblemsSolved)"\s*:\s*(\d+)/i
            ];
            
            for (const pattern of patterns) {
              const match = html.match(pattern);
              if (match) {
                const num = parseInt(match[1]);
                // Problems solved is typically 0-500 for most users
                if (num >= 0 && num <= 1000) {
                  problemsSolved = num;
                  console.log(`GFG: Found problems solved: ${problemsSolved}`);
                  break;
                }
              }
            }
          }

          // Coding Score - look for "Score" or "Coding Score" with a 3+ digit number
          if (!codingScore) {
            const patterns = [
              // Look for "Coding Score" or "Overall Coding Score"
              /(?:Overall\s+)?Coding\s+Score[^\d]*(\d{3,})/i,
              /(\d{3,})[^\w]*(?:Overall\s+)?Coding\s+Score/i,
              // Look for just "Score" with 3+ digits (but not too large)
              /Score[^\d]*(\d{3,5})/i,
              /(\d{3,5})[^\w]*Score/i,
              // JSON patterns
              /"(?:codingScore|coding_score)"\s*:\s*(\d+)/i
            ];
            
            for (const pattern of patterns) {
              const match = html.match(pattern);
              if (match) {
                const num = parseInt(match[1]);
                // Coding score is typically 100-10000, exclude very small or very large numbers
                if (num >= 100 && num <= 50000) {
                  codingScore = num;
                  console.log(`GFG: Found coding score: ${codingScore}`);
                  break;
                }
              }
            }
          }

          // Institute Rank - must have "institute" or "college" AND "rank" nearby
          if (!instituteRank) {
            const patterns = [
              // Pattern: Number directly before/after "Institute Rank" text
              /Institute\s+Rank[^\d]*(\d+)/i,
              /(\d+)[^\w]*Institute\s+Rank/i,
              /College\s+Rank[^\d]*(\d+)/i,
              /(\d+)[^\w]*College\s+Rank/i,
              // JSON patterns
              /"(?:instituteRank|institute_rank|college_rank)"\s*:\s*(\d+)/i
            ];
            
            for (const pattern of patterns) {
              const match = html.match(pattern);
              if (match) {
                const num = parseInt(match[1]);
                // Institute rank is typically 1-10000
                if (num > 0 && num <= 10000) {
                  instituteRank = num;
                  console.log(`GFG: Found institute rank: ${instituteRank}`);
                  break;
                }
              }
            }
          }

          if (problemsSolved || codingScore) {
            break; // Found some data, stop trying URLs
          }
        } catch (urlError) {
          console.log(`GFG: URL failed: ${urlError.message}`);
        }
      }

      const result = {
        problemsSolved,
        codingScore,
        instituteRank,
        instituteName,
        success: true
      };
      
      console.log('GFG: Final result:', result);
      return result;

    } catch (error) {
      console.error('GeeksForGeeks fetch error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch data from all platforms for a user
   */
  async fetchAllPlatformData(platforms) {
    const results = {
      leetcode: null,
      codeforces: null,
      codechef: null,
      gfg: null
    };

    const promises = [];

    if (platforms.leetcode) {
      promises.push(
        this.fetchLeetCodeData(platforms.leetcode)
          .then(data => { results.leetcode = data; })
          .catch(err => { results.leetcode = { success: false, error: err.message }; })
      );
    }

    if (platforms.codeforces) {
      promises.push(
        this.fetchCodeforcesData(platforms.codeforces)
          .then(data => { results.codeforces = data; })
          .catch(err => { results.codeforces = { success: false, error: err.message }; })
      );
    }

    if (platforms.codechef) {
      promises.push(
        this.fetchCodeChefData(platforms.codechef)
          .then(data => { results.codechef = data; })
          .catch(err => { results.codechef = { success: false, error: err.message }; })
      );
    }

    if (platforms.gfg) {
      promises.push(
        this.fetchGeeksForGeeksData(platforms.gfg)
          .then(data => { results.gfg = data; })
          .catch(err => { results.gfg = { success: false, error: err.message }; })
      );
    }

    await Promise.all(promises);

    return results;
  }
}

module.exports = new PlatformService();
