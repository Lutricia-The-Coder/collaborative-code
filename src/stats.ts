import pool from "./db";

export async function getProjectStats(
    projectId: string
) {
    const averageReviewTime = await pool.query(
        `SELECT AVG(
            EXTRACT(EPOCH FROM (rh.created_at - s.created_at))
         ) AS average_review_time
         FROM review_history rh
         JOIN submissions s
           ON rh.submission_id = s.id
         WHERE s.project_id = $1`,
        [projectId]
    );

   const reviewResults = await pool.query(
    `SELECT rh.status, COUNT(*) AS count
     FROM review_history rh
     JOIN submissions s
       ON rh.submission_id = s.id
     WHERE s.project_id = $1
     GROUP BY rh.status`,
    [projectId]
);
    const reviewerActivity = await pool.query(
        `SELECT reviewer_id, COUNT(*) AS review_count
         FROM review_history rh
         JOIN submissions s
           ON rh.submission_id = s.id
         WHERE s.project_id = $1
         GROUP BY reviewer_id`,
        [projectId]
    );

    const mostCommented = await pool.query(
        `SELECT
            s.id,
            s.title,
            COUNT(c.id) AS comment_count
         FROM submissions s
         LEFT JOIN comments c
           ON c.submission_id = s.id
         WHERE s.project_id = $1
         GROUP BY s.id, s.title
         ORDER BY comment_count DESC
         LIMIT 1`,
        [projectId]
    );

    return {
        average_review_time:
            averageReviewTime.rows[0].average_review_time,
        review_results: reviewResults.rows,
        reviewer_activity: reviewerActivity.rows,
        most_commented_submission:
            mostCommented.rows[0] || null
    };
}