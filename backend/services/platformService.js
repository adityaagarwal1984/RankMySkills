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
     // console.log(`CodeChef: Fetching data for ${username}`);
      
      // Removed failing API endpoints as per requirement
      // Focusing on Web Scraping which is more reliable for problems solved count

      // Fallback: Web scraping with improved patterns
      //console.log('CodeChef: Using web scraping');
      const response = await axios.get(`https://www.codechef.com/users/${username}`, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      const html = response.data;
      let rating = null, maxRating = null, problemsSolved = null;

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
        if (max >= (rating || 0) && max <= 5000) {
          maxRating = max;
          //console.log(`CodeChef: Max rating: ${maxRating}`);
        }
      }
      if (!maxRating && rating !== null) maxRating = rating;

      // Extract problems solved - Updated patterns
      //console.log('CodeChef: Looking for problems solved...');
      
      // Extract problems solved - STRICT "Total Problems Solved" pattern only
      // Matches <h3>Total Problems Solved: 0</h3> or similar
      const specificH3Pattern = /Total\s+Problems\s+Solved\s*:\s*(\d+)/i;
      const h3ExactMatch = html.match(specificH3Pattern);
      
      if (h3ExactMatch) {
         problemsSolved = parseInt(h3ExactMatch[1]);
      }


      const result = { rating, maxRating, problemsSolved, success: true };
     // console.log('CodeChef: Final result:', result);
      return result;
      
    } catch (error) {
      console.error('CodeChef error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync all platform data for a student
   */
  async syncStudentData(student) {
    console.log(`Syncing data for student: ${student.username || student.name}`);
    const results = {
      leetcode: { success: false },
      codeforces: { success: false },
      codechef: { success: false },
      gfg: { success: false }
    };

    try {
      if (student.platforms?.leetcode) {
        const data = await this.fetchLeetCodeData(student.platforms.leetcode);
        if (data.success) {
          student.ratings.leetcode = data.rating || student.ratings.leetcode;
          student.max_ratings.leetcode = data.maxRating || student.max_ratings.leetcode;
          student.problems_solved.leetcode = data.problemsSolved || student.problems_solved.leetcode;
          results.leetcode.success = true;
        }
      }

      if (student.platforms?.codeforces) {
        const data = await this.fetchCodeforcesData(student.platforms.codeforces);
        if (data.success) {
          student.ratings.codeforces = data.rating || student.ratings.codeforces;
          student.max_ratings.codeforces = data.maxRating || student.max_ratings.codeforces;
          student.problems_solved.codeforces = data.problemsSolved || student.problems_solved.codeforces;
          results.codeforces.success = true;
        }
      }

      if (student.platforms?.codechef) {
        const data = await this.fetchCodeChefData(student.platforms.codechef);
        if (data.success) {
          student.ratings.codechef = data.rating ?? student.ratings.codechef ?? 0;
          // Use maxRating from fetch result, not globalRank
          student.max_ratings.codechef = data.maxRating ?? student.max_ratings.codechef ?? 0;
          student.problems_solved.codechef = data.problemsSolved ?? student.problems_solved.codechef ?? 0;
          results.codechef.success = true;
        }
      }

      if (student.platforms?.gfg) {
        const data = await this.fetchGeeksForGeeksData(student.platforms.gfg);
        if (data.success) {
          student.problems_solved.gfg = data.problemsSolved ?? student.problems_solved.gfg ?? 0;
          student.gfg_coding_score = data.codingScore ?? student.gfg_coding_score ?? 0;
          student.gfg_institute_rank = data.instituteRank ?? student.gfg_institute_rank ?? 0;
          results.gfg.success = true;
        }
      }
      
      // Calculate global score if method exists
      if (typeof student.calculateGlobalEngineerScore === 'function') {
         student.calculateGlobalEngineerScore();
      }

      student.last_synced = new Date();
      await student.save();
      console.log(`Synced data for ${student.name}:`, results);
      return { success: true, results };
    } catch (error) {
      console.error(`Sync error for ${student.name}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch GeeksForGeeks user data using web scraping
   */
  async fetchGeeksForGeeksData(username) {
    try {
      console.log(`GFG: Fetching data for ${username}`);
      
      let problemsSolved = null;
      let codingScore = null;
      let instituteRank = null;
      let instituteName = null;

      // Try the main profile page
      const urls = [
        `https://www.geeksforgeeks.org/user/${username}`,
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
          
          // Pattern provided by user based on exact class names
          // <div class="ScoreContainer_text-box__MF3bg"><p class="ScoreContainer_label__aVpLE">Problems Solved</p><p class="ScoreContainer_value__7yy7h">130</p></div>
          
          // Problems Solved
          if (problemsSolved === null) {
            // Expanded patterns for problems solved - wider net like Coding Score
            const patterns = [
               // Specific structure provided by user with flexibility
               /Problems?\s+Solved\s*<\/p>\s*<p[^>]*>(\d+)\s*<\/p>/i,
               // Label then Value in separate tags
               /Problems?\s+Solved[^\d]{0,50}<[^>]+>(\d+)</i,
               // Value then Label
               />(\d+)<[^>]+>[^<]{0,50}Problems?\s+Solved/i,
               // Plain text proximity
               /Problems?\s+Solved\s*[:\-]?\s*(\d+)/i,
               // Number of problems solved
               /(\d+)\s*problems?\s*solved/i
            ];

            for (const pattern of patterns) {
               const match = html.match(pattern);
               if (match) {
                  problemsSolved = parseInt(match[1]);
                  console.log(`GFG: Found problems solved via pattern ${pattern}: ${problemsSolved}`);
                  break;
               }
            }
          }

          // Coding Score
          if (codingScore === null) {
            // Priority 0: Exact structure provided by user usage of ScoreContainer classes
            // <div class="ScoreContainer_text-box__MF3bg"><p class="ScoreContainer_label__aVpLE">Coding Score</p><p class="ScoreContainer_value__7yy7h">455</p></div>
            const specificContainerPattern = /ScoreContainer_label__[^>]*>Coding\s+Score<\/p>\s*<p[^>]*class="ScoreContainer_value__[^>]*>(\d+)<\/p>/i;
            const containerMatch = html.match(specificContainerPattern);
            
            if (containerMatch) {
               codingScore = parseInt(containerMatch[1]);
               console.log(`GFG: Found coding score via ScoreContainer pattern: ${codingScore}`);
            }

            // Priority 1: Exact new design match
            // <span class="score_card_value">520</span> ... <span class="score_card_label">Coding Score</span>
            if (codingScore === null) {
                const scoreCardPattern = /class="score_card_value"[^>]*>(\d+)<[^>]*>[\s\S]{0,100}Coding\s+Score/i;
                const scoreCardMatch = html.match(scoreCardPattern);
                if (scoreCardMatch) {
                  codingScore = parseInt(scoreCardMatch[1]);
                  console.log(`GFG: Found coding score via score_card_value: ${codingScore}`);
                }
            }

            // Priority 2: Old/Standard Patterns
            if (codingScore === null) {
               const patterns = [
                  /Coding\s+Score\s*<\/p>\s*<p[^>]*>(\d+)\s*<\/p>/i,
                  /Coding\s+Score(?:<\/p>|<\/span>|[^<]*)(?:<[^>]*>)*?(\d+)/i,
                   // JSON patterns often embedded in script tags
                  /"codingScore"\s*:\s*(\d+)/i,
                  /"score"\s*:\s*(\d+)/i
               ];

               for (const pattern of patterns) {
                  const match = html.match(pattern);
                  if (match) {
                     codingScore = parseInt(match[1]);
                     console.log(`GFG: Found coding score via pattern ${pattern}: ${codingScore}`);
                     break;
                  }
               }
            }
            
            // Priority 3: Nav bar or Sidebar score (often simple number)
            // Look for "Score: 135" or similar
            if (codingScore === null) {
               const navPattern = /Score\s*:\s*(\d+)/i;
               const navMatch = html.match(navPattern);
               if (navMatch) {
                 const num = parseInt(navMatch[1]);
                 if (num > 10) { // Avoid trivial numbers
                    codingScore = num;
                 }
               }
            }
          }


          // Institute Rank
          if (instituteRank === null) {
             // Expanded patterns for Institute Rank - wider net
             const patterns = [
                // Specific structure with anchor tag
                /Institute\s+Rank\s*<\/p>\s*<p[^>]*>(?:<a[^>]*>)?\s*(\d+)\s*(?:<\/a>)?\s*<\/p>/i,
                // Label then Value (with or without anchor)
                /Institute\s+Rank[^\d]{0,50}<(?:a|p|span|div)[^>]*>(\d+)/i,
                // Value then Label
                />(\d+)<[^>]+>[^<]{0,50}Institute\s+Rank/i,
                // Specific anchor tag containment
                /Institute\s+Rank.*?<a[^>]*>(\d+)<\/a>/i,
                // Plain text proximity
                /Institute\s+Rank\s*[:\-]?\s*(\d+)/i
             ];

             for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match) {
                   instituteRank = parseInt(match[1]);
                   console.log(`GFG: Found institute rank via pattern ${pattern}: ${instituteRank}`);
                   break;
                }
             }
          }
          
          // Fallback to previous patterns if specific ones fail
          // Look for data in very specific patterns to avoid mixing up values
          // Problems Solved - must have "problem" or "question" AND "solved" nearby
          if (problemsSolved === null) {
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
          if (codingScore === null) {
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
          if (instituteRank === null) {
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

          if (problemsSolved !== null || codingScore !== null) {
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
   * Verify verification code in LeetCode profile
   */
  async verifyLeetCodeProfile(username, verificationCode) {
    try {
      const query = `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            profile {
              aboutMe
            }
          }
        }
      `;

      const response = await axios.post('https://leetcode.com/graphql', {
        query,
        variables: { username }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 10000
      });

      const aboutMe = response.data?.data?.matchedUser?.profile?.aboutMe || '';
      return aboutMe.includes(verificationCode);
    } catch (error) {
      console.error('LeetCode verification error:', error.message);
      return false;
    }
  }

  /**
   * Verify verification code in Codeforces profile
   */
  async verifyCodeforcesProfile(username, verificationCode) {
    try {
      const response = await axios.get(`https://codeforces.com/api/user.info?handles=${username}`, {
        timeout: 10000
      });

      if (response.data?.status === 'OK' && response.data.result?.length > 0) {
        const user = response.data.result[0];
        const combinedName = (user.firstName || '') + ' ' + (user.lastName || '');
        return combinedName.includes(verificationCode);
      }
      return false;
    } catch (error) {
      console.error('Codeforces verification error:', error.message);
      return false;
    }
  }

  /**
   * Verify verification code in CodeChef profile (search entire page content)
   */
  async verifyCodeChefProfile(username, verificationCode) {
    try {
      console.log('Verifying CodeChef profile for:', username, 'Code:', verificationCode);
      const url = `https://www.codechef.com/users/${username}`;
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });

      const html = response.data;
      // Search for the verification code anywhere in the HTML content
      const found = html.includes(verificationCode);
      console.log('CodeChef verification result:', found ? 'Found' : 'Not found');
      return found;
    } catch (error) {
      console.error('CodeChef verification error:', error.message);
      return false;
    }
  }

  /**
   * Verify verification code in GFG profile (search entire page content)
   */
  async verifyGFGProfile(username, verificationCode) {
    try {
      console.log('Verifying GFG profile for:', username, 'Code:', verificationCode);
      
      const urls = [
        `https://auth.geeksforgeeks.org/user/${username}`,
        `https://www.geeksforgeeks.org/user/${username}`
      ];
      
      for (const url of urls) {
        try {
          const response = await axios.get(url, {
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html',
              'Referer': 'https://www.geeksforgeeks.org/'
            }
          });

          const html = response.data;
          // Search for the verification code anywhere in the HTML content
          // This creates a robust check regardless of where the user puts the code
          // or how the page structure changes
          if (html.includes(verificationCode)) {
            console.log('GFG verification found in:', url);
            return true;
          }
        } catch (urlError) {
          console.log('GFG: Failed to fetch from', url);
        }
      }

      console.log('GFG: Verification code not found in any source');
      return false;
    } catch (error) {
      console.error('GFG verification error:', error.message);
      return false;
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
